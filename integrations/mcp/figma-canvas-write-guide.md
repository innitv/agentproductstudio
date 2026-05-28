# Руководство по записи на холст Figma через MCP

## 1. Введение и назначение

Это руководство описывает спецификацию и правила использования Figma MCP сервера для автоматической генерации, размещения и редактирования UI-макетов непосредственно на холсте Figma. Агенты используют это руководство для переноса текстовых спецификаций экранов (из `screens.md`) во фреймы и слои Figma, обеспечивая синхронизацию проектирования и разработки.

---

## 2. Подключение и доступы

Запись на холст Figma возможна в двух режимах, прописанных в `mcp_config.json`:

1. **Remote MCP Server (Рекомендуемый)**:
   - URL: `https://mcp.figma.com/mcp`
   - Требует OAuth-авторизации и локального ключа `FIGMA_API_TOKEN` в файле `.env`.
2. **Desktop Fallback Server**:
   - URL: `http://127.0.0.1:3845/mcp`
   - Работает локально через приложение Figma Desktop с включенной панелью Inspect (Dev Mode).

---

## 3. Спецификация инструмента `use_figma`

Универсальный инструмент для работы с элементами Figma — **`use_figma`**. Он позволяет создавать, изменять и удалять элементы.

### Параметры инструмента `use_figma`

| Параметр | Тип | Описание |
| :--- | :--- | :--- |
| `figma_url` | string | Ссылка на файл или фрейм Figma (например, `https://www.figma.com/design/KEY/Name?node-id=ID`) |
| `action` | string | Выполняемое действие: `create_node`, `update_node`, `delete_node`, `get_node_details`, `create_component` |
| `payload` | object | Тело запроса (спецификация ноды в формате Figma REST API) |

---

## 4. Маппинг токенов дизайн-системы A3

При генерации элементов на холсте агенты обязаны использовать значения из локальной дизайн-системы `design/figma/a3-design-system/token-map.md`.

### Цветовая палитра A3 (в формате Figma RGBA 0-1)

| Токен | Назначение | Значение HEX | Значение Figma RGBA |
| :--- | :--- | :--- | :--- |
| `a3-bg-primary` | Основной фон страницы | `#0F172A` (Slate 900) | `{"r": 0.059, "g": 0.09, "b": 0.165, "a": 1}` |
| `a3-bg-secondary`| Фон карточек и секций | `#1E293B` (Slate 800) | `{"r": 0.118, "g": 0.161, "b": 0.231, "a": 1}` |
| `a3-text-primary`| Основной текст и заголовки| `#F8FAFC` (Slate 50) | `{"r": 0.973, "g": 0.98, "b": 0.988, "a": 1}` |
| `a3-text-muted`  | Вспомогательный текст | `#94A3B8` (Slate 400) | `{"r": 0.58, "g": 0.639, "b": 0.722, "a": 1}` |
| `a3-accent-cta`  | Кнопки призыва к действию | `#3B82F6` (Blue 500) | `{"r": 0.231, "g": 0.509, "b": 0.965, "a": 1}` |
| `a3-border`      | Разделители и рамки | `#334155` (Slate 700) | `{"r": 0.2, "g": 0.255, "b": 0.333, "a": 1}` |

### Типографика (Шрифт по умолчанию: Inter или Outfit)
- **Заголовок H1**: `fontSize: 48`, `fontWeight: 700` (Bold), `letterSpacing: -0.02`
- **Заголовок H2**: `fontSize: 32`, `fontWeight: 600` (SemiBold)
- **Основной текст**: `fontSize: 16`, `fontWeight: 400` (Regular)
- **Кнопки/Подписи**: `fontSize: 14`, `fontWeight: 500` (Medium)

---

## 5. Примеры JSON-запросов (Payloads)

### А. Создание основного фрейма страницы (Desktop Landing Frame)

Создает холст размером 1440x3000 пикселей со Slate 900 фоном и Auto Layout.

```json
{
  "figma_url": "https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System",
  "action": "create_node",
  "payload": {
    "parent_id": "0:1",
    "node": {
      "type": "FRAME",
      "name": "Desktop Landing - AI Agent Studio",
      "absoluteBoundingBox": { "x": 100, "y": 100, "width": 1440, "height": 3000 },
      "backgroundColor": { "r": 0.059, "g": 0.09, "b": 0.165, "a": 1 },
      "layoutMode": "VERTICAL",
      "primaryAxisSizingMode": "AUTO",
      "counterAxisSizingMode": "FIXED",
      "itemSpacing": 0,
      "paddingTop": 0,
      "paddingBottom": 0,
      "paddingLeft": 0,
      "paddingRight": 0
    }
  }
}
```

### Б. Создание секции Hero с заголовком и CTA-кнопкой

Добавляет Auto Layout секцию с заголовком и кнопкой внутрь созданного Landing Frame.

```json
{
  "figma_url": "https://www.figma.com/design/4ufM1XdtXzSwbCNpulxETA/A3-Design-System",
  "action": "create_node",
  "payload": {
    "parent_id": "LANDING_FRAME_NODE_ID",
    "node": {
      "type": "FRAME",
      "name": "Hero Section",
      "layoutMode": "VERTICAL",
      "primaryAxisSizingMode": "AUTO",
      "counterAxisSizingMode": "FIXED",
      "width": 1440,
      "itemSpacing": 32,
      "paddingTop": 120,
      "paddingBottom": 120,
      "paddingLeft": 160,
      "paddingRight": 160,
      "backgroundColor": { "r": 0.059, "g": 0.09, "b": 0.165, "a": 1 },
      "children": [
        {
          "type": "TEXT",
          "name": "Headline",
          "characters": "Создавайте AI-агентов без кода",
          "style": {
            "fontFamily": "Inter",
            "fontSize": 56,
            "fontWeight": 800,
            "fills": [{ "type": "SOLID", "color": { "r": 0.973, "g": 0.98, "b": 0.988 } }]
          }
        },
        {
          "type": "TEXT",
          "name": "Subtitle",
          "characters": "Платформа для быстрой сборки, оркестрации и деплоя автономных агентов для вашего бизнеса.",
          "style": {
            "fontFamily": "Inter",
            "fontSize": 20,
            "fontWeight": 400,
            "fills": [{ "type": "SOLID", "color": { "r": 0.58, "g": 0.639, "b": 0.722 } }]
          }
        },
        {
          "type": "FRAME",
          "name": "CTA Button",
          "layoutMode": "HORIZONTAL",
          "primaryAxisSizingMode": "AUTO",
          "counterAxisSizingMode": "AUTO",
          "paddingTop": 16,
          "paddingBottom": 16,
          "paddingLeft": 32,
          "paddingRight": 32,
          "cornerRadius": 8,
          "backgroundColor": { "r": 0.231, "g": 0.509, "b": 0.965, "a": 1 },
          "children": [
            {
              "type": "TEXT",
              "name": "Button Text",
              "characters": "Начать бесплатно",
              "style": {
                "fontFamily": "Inter",
                "fontSize": 16,
                "fontWeight": 600,
                "fills": [{ "type": "SOLID", "color": { "r": 1, "g": 1, "b": 1 } }]
              }
            }
          ]
        }
      ]
    }
  }
}
```

---

## 6. Правила безопасности и Guardrails

1. **Режим одобрения (Human-in-the-Loop)**:
   - Перед любой отправкой мутирующих JSON-запросов в Figma MCP агент ОБЯЗАН вывести сгенерированный JSON в чат пользователю и дождаться явного текстового подтверждения (например: *"Да, отправляй в Figma"*).
2. **Только разрешенные файлы**:
   - Агент может изменять только те файлы Figma, ссылки на которые явно предоставил пользователь во входном брифе или в параметре `figma_url`.
3. **Безопасность токенов**:
   - Запрещено жестко кодировать API-токены в генерируемый код. Рантайм извлекает их из системных переменных окружения.
