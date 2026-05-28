import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [, , pageArg, outputDirArg = "outputs/saas-ai/2026-05-27"] = process.argv;

if (!pageArg) {
  console.error("Usage: node tooling/scripts/publish-notion-stories.mjs <notion-page-url-or-id> [output-dir]");
  process.exit(1);
}

const token = readNotionToken();
const parentPageId = extractPageId(pageArg);
const outputDir = resolve(process.cwd(), outputDirArg);

const personasPath = join(outputDir, "proto-personas.md");
const prdPath = join(outputDir, "prd.md");

if (!existsSync(personasPath) || !existsSync(prdPath)) {
  console.error("Error: outputs do not contain proto-personas.md or prd.md");
  process.exit(1);
}

async function main() {
  console.log(`Starting Notion Agile Board export under parent page: ${parentPageId}`);

  // 1. Считываем и парсим персон
  const personasContent = readFileSync(personasPath, "utf8");
  const parsedPersonas = parsePersonas(personasContent);
  console.log(`Parsed ${parsedPersonas.length} personas.`);

  // 2. Считываем и парсим требования и пользовательские истории
  const prdContent = readFileSync(prdPath, "utf8");
  const parsedStories = parseUserStories(prdContent);
  console.log(`Parsed ${parsedStories.length} user stories.`);

  const parsedCriteria = parseAcceptanceCriteria(prdContent);
  console.log(`Parsed ${parsedCriteria.length} acceptance criteria.`);

  // 3. Создаем базу данных Персон
  console.log("Creating Personas Database...");
  const personasDbId = await createPersonasDatabase(parentPageId);
  console.log(`Personas Database created: ${personasDbId}`);

  // 4. Наполняем базу Персон
  const personaMap = {}; // Имя персоны -> ID страницы в Notion
  for (const persona of parsedPersonas) {
    const pageId = await createPersonaPage(personasDbId, persona);
    personaMap[persona.name.toLowerCase()] = pageId;
    console.log(`Added persona: "${persona.name}"`);
  }

  // 5. Создаем базу данных User Stories (с Relation на базу Персон)
  console.log("Creating User Stories Database...");
  const storiesDbId = await createStoriesDatabase(parentPageId, personasDbId);
  console.log(`User Stories Database created: ${storiesDbId}`);

  // 6. Наполняем базу User Stories
  for (let i = 0; i < parsedStories.length; i++) {
    const story = parsedStories[i];
    const storyId = `US-${String(i + 1).padStart(3, "0")}`;
    
    // Находим связанную персону
    let relatedPersonaPageId = null;
    const lowerRole = story.role.toLowerCase();
    for (const [name, pageId] of Object.entries(personaMap)) {
      if (name.includes(lowerRole) || lowerRole.includes(name)) {
        relatedPersonaPageId = pageId;
        break;
      }
    }

    const pageId = await createStoryPage(storiesDbId, storyId, story, relatedPersonaPageId);
    console.log(`Added User Story: ${storyId} - "${story.title}"`);

    // Генерируем чек-лист Acceptance Criteria в теле страницы
    const blocks = [
      heading(2, "User Story Description"),
      paragraph(`**Как** ${story.role},\n**Я хочу** ${story.want},\n**Чтобы** ${story.soThat}.`),
      heading(2, "Acceptance Criteria")
    ];

    // Добавляем чек-боксы
    if (parsedCriteria.length > 0) {
      for (const criterion of parsedCriteria) {
        blocks.push(todoBlock(criterion));
      }
    } else {
      blocks.push(todoBlock("Интерфейс соответствует дизайн-спецификации."));
      blocks.push(todoBlock("Основной пользовательский сценарий работает без сбоев."));
    }

    await appendChildren(pageId, blocks);
  }

  console.log("\n=== Agile Board successfully exported to Notion! ===");
  console.log("Check your parent page for the new connected databases.");
}

// === Вспомогательные функции парсинга ===

function parsePersonas(content) {
  const lines = content.split(/\r?\n/);
  const personas = [];
  let isTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const parts = trimmed.split("|").map(p => p.trim()).slice(1, -1);
      if (parts[0] === "Persona" || parts[0].startsWith("---")) {
        isTable = true;
        continue;
      }
      if (isTable) {
        personas.push({
          name: parts[0],
          segment: parts[1],
          jtbd: parts[2],
          trigger: parts[3],
          pain: parts[4],
          desiredOutcome: parts[5],
          evidenceStatus: parts[6] || "proto"
        });
      }
    } else {
      isTable = false;
    }
  }

  return personas;
}

function parseUserStories(content) {
  const stories = [];
  
  // Ищем секцию ## User Stories
  const match = content.match(/## User Stories[\s\S]*?(?:\n## |$)/);
  if (!match) return [];

  const section = match[0];
  const items = section.split(/\n\d+\.\s+/);

  for (const item of items) {
    const lines = item.split(/\r?\n/);
    const titleLine = lines[0].replace(/^\*\*|\*\*$/g, "").replace(/:$/, "").trim();
    if (!titleLine || titleLine.startsWith("##")) continue;

    let role = "";
    let want = "";
    let soThat = "";

    for (const line of lines) {
      const clean = line.replace(/^\s*[-*]\s+/, "").replace(/\*+/g, "").trim();
      if (clean.startsWith("Как")) role = clean.replace(/^Как\s+/, "");
      if (clean.startsWith("Я хочу")) want = clean.replace(/^Я хочу\s+/, "");
      if (clean.startsWith("Чтобы")) soThat = clean.replace(/^Чтобы\s+/, "");
    }

    if (role && want && soThat) {
      stories.push({
        title: titleLine,
        role,
        want,
        soThat
      });
    }
  }

  return stories;
}

function parseAcceptanceCriteria(content) {
  const criteria = [];
  const lines = content.split(/\r?\n/);
  let isTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const parts = trimmed.split("|").map(p => p.trim()).slice(1, -1);
      if (parts[0] === "Criterion" || parts[0].startsWith("---")) {
        isTable = true;
        continue;
      }
      if (isTable) {
        criteria.push(`${parts[0]} (${parts[1] || ""})`);
      }
    } else {
      isTable = false;
    }
  }

  // Fallback: пробуем плоский список критериев из JSON frontmatter или Markdown
  if (criteria.length === 0) {
    const listMatch = content.match(/## Acceptance Criteria[\s\S]*?(?:\n## |$)/);
    if (listMatch) {
      const items = listMatch[0].matchAll(/^\s*[-*]\s+(.*)$/gm);
      for (const item of items) {
        criteria.push(item[1].trim());
      }
    }
  }

  return criteria;
}

// === API Интеграция с Notion ===

function readNotionToken() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    throw new Error("Missing .env with NOTION_TOKEN.");
  }

  const match = readFileSync(envPath, "utf8").match(/^NOTION_TOKEN=(.+)$/m);
  if (!match?.[1]?.trim()) {
    throw new Error("NOTION_TOKEN is missing in .env.");
  }

  return match[1].trim();
}

function extractPageId(value) {
  const compact = value.replace(/-/g, "");
  const match = compact.match(/[0-9a-f]{32}/i);
  if (!match) {
    throw new Error(`Cannot extract Notion page id from: ${value}`);
  }
  return match[0];
}

function notionHeaders() {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };
}

async function createPersonasDatabase(parentId) {
  const response = await fetch("https://api.notion.com/v1/databases", {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentId },
      title: [{ type: "text", text: { content: "Proto Personas (Персоны)" } }],
      properties: {
        Persona: { title: {} },
        Segment: { rich_text: {} },
        JTBD: { rich_text: {} },
        Pain: { rich_text: {} },
        "Desired Outcome": { rich_text: {} },
        "Evidence Status": {
          select: {
            options: [
              { name: "proto", color: "orange" },
              { name: "needs validation", color: "red" },
              { name: "validated", color: "green" }
            ]
          }
        }
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion create Personas database failed (${response.status}): ${body}`);
  }

  const json = await response.json();
  return json.id;
}

async function createPersonaPage(dbId, persona) {
  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        Persona: { title: [{ text: { content: persona.name } }] },
        Segment: { rich_text: [{ text: { content: persona.segment || "" } }] },
        JTBD: { rich_text: [{ text: { content: persona.jtbd || "" } }] },
        Pain: { rich_text: [{ text: { content: persona.pain || "" } }] },
        "Desired Outcome": { rich_text: [{ text: { content: persona.desiredOutcome || "" } }] },
        "Evidence Status": { select: { name: persona.evidenceStatus === "validated" ? "validated" : persona.evidenceStatus === "needs validation" ? "needs validation" : "proto" } }
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion create Persona page failed (${response.status}): ${body}`);
  }

  const json = await response.json();
  return json.id;
}

async function createStoriesDatabase(parentId, personasDbId) {
  const response = await fetch("https://api.notion.com/v1/databases", {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentId },
      title: [{ type: "text", text: { content: "User Stories (Агиль-доска)" } }],
      properties: {
        Story: { title: {} },
        ID: { rich_text: {} },
        Persona: { relation: { database_id: personasDbId, single_property: {} } },
        Priority: {
          select: {
            options: [
              { name: "Must", color: "red" },
              { name: "Should", color: "yellow" },
              { name: "Could", color: "blue" },
              { name: "Won't", color: "gray" }
            ]
          }
        },
        Status: {
          status: {
            options: [
              { name: "Not started", color: "gray" },
              { name: "In progress", color: "blue" },
              { name: "Completed", color: "green" }
            ]
          }
        }
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion create Stories database failed (${response.status}): ${body}`);
  }

  const json = await response.json();
  return json.id;
}

async function createStoryPage(dbId, storyId, story, relatedPersonaPageId) {
  const properties = {
    Story: { title: [{ text: { content: story.title } }] },
    ID: { rich_text: [{ text: { content: storyId } }] },
    Priority: { select: { name: "Must" } }, // По умолчанию Must для MVP
    Status: { status: { name: "Not started" } }
  };

  if (relatedPersonaPageId) {
    properties.Persona = { relation: [{ id: relatedPersonaPageId }] };
  }

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion create Story page failed (${response.status}): ${body}`);
  }

  const json = await response.json();
  return json.id;
}

// === Blocks utilities ===

function heading(level, text) {
  const type = `heading_${level}`;
  return {
    object: "block",
    type,
    [type]: {
      rich_text: [{ type: "text", text: { content: text } }],
    },
  };
}

function paragraph(text) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: text } }],
    },
  };
}

function todoBlock(text) {
  return {
    object: "block",
    type: "to_do",
    to_do: {
      rich_text: [{ type: "text", text: { content: text } }],
      checked: false
    }
  };
}

async function appendChildren(blockId, blocks) {
  const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
    method: "PATCH",
    headers: notionHeaders(),
    body: JSON.stringify({ children: blocks }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion append failed (${response.status}): ${body}`);
  }
}

main().catch((error) => {
  console.error("Execution failed:", error);
  process.exit(1);
});
