import {
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Heart,
  Home,
  Info,
  Mail,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import type React from "react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip, ChipDismissIcon } from "@/components/ui/chip";
import { Dropdown, DropdownDivider, DropdownGroupTitle, DropdownItem } from "@/components/ui/dropdown";
import { FunctionButton } from "@/components/ui/function-button";
import { IconButton } from "@/components/ui/icon-button";
import { InlineNotification } from "@/components/ui/inline-notification";
import { Input } from "@/components/ui/input";
import { InputCard } from "@/components/ui/input-card";
import { Radio } from "@/components/ui/radio";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

const selectOptions = [
  { icon: <User aria-hidden="true" />, label: "Профиль", value: "profile" },
  { hint: "По умолчанию", icon: <ShieldCheck aria-hidden="true" />, label: "Проверено", value: "verified" },
  { disabled: true, label: "Недоступно", value: "disabled" },
];

const notificationActions = [
  {
    actionIcon: <ChevronRight aria-hidden="true" />,
    icon: <Heart aria-hidden="true" />,
    label: "Button",
    variant: "secondary" as const,
  },
  {
    actionIcon: <ChevronRight aria-hidden="true" />,
    icon: <Heart aria-hidden="true" />,
    label: "Button",
    variant: "tertiary" as const,
  },
];

function PlaygroundSection({
  children,
  description,
  id,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  id?: string;
  title: string;
}) {
  return (
    <section className="component-playground-section" aria-labelledby={`${title}-title`} id={id}>
      <div className="component-playground-section__header">
        <h2 id={`${title}-title`}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="component-playground-section__body">{children}</div>
    </section>
  );
}

function ComponentTile({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <article className="component-playground-tile">
      <h3>{title}</h3>
      <div className="component-playground-tile__content">{children}</div>
    </article>
  );
}

export function ComponentsPlayground() {
  return (
    <main className="component-playground-shell">
      <header className="component-playground-header">
        <div>
          <p>A3 Design System</p>
          <h1>Компоненты</h1>
        </div>
        <nav aria-label="Playground navigation">
          <a href="/">Лендинг</a>
          <a href="#feedback">Feedback</a>
          <a href="#inputs">Inputs</a>
        </nav>
      </header>

      <PlaygroundSection title="Buttons" description="Базовые кнопки, icon button и function button.">
        <ComponentTile title="Button variants">
          <div className="component-playground-row">
            <Button leadingIcon={<Check aria-hidden="true" />} size="xl">
              Primary
            </Button>
            <Button size="l" variant="secondary">
              Secondary
            </Button>
            <Button size="m" variant="outline">
              Outline
            </Button>
            <Button actionIcon={<ChevronRight aria-hidden="true" />} size="s" variant="ghost">
              Ghost
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </ComponentTile>

        <ComponentTile title="Icon and function buttons">
          <div className="component-playground-row">
            <IconButton aria-label="Settings" icon={<Settings aria-hidden="true" />} size="xl" />
            <IconButton aria-label="More" colorScheme="neutral" icon={<MoreHorizontal aria-hidden="true" />} size="l" variant="secondary" />
            <IconButton aria-label="Search" icon={<Search aria-hidden="true" />} size="m" variant="outline" />
            <IconButton aria-label="Close" colorScheme="neutral" icon={<X aria-hidden="true" />} size="s" variant="ghost" />
            <FunctionButton actionIcon={<ChevronRight aria-hidden="true" />} icon={<Heart aria-hidden="true" />}>
              Function
            </FunctionButton>
          </div>
        </ComponentTile>
      </PlaygroundSection>

      <PlaygroundSection title="Controls" description="Переключатели, радиокнопки, чекбоксы и сегменты.">
        <ComponentTile title="Checkbox / radio / switch">
          <div className="component-playground-stack">
            <div className="component-playground-row">
              <Checkbox defaultChecked label="Checked" />
              <Checkbox indeterminate label="Mixed" size="xs" />
              <Checkbox disabled label="Disabled" />
            </div>
            <div className="component-playground-row">
              <Radio defaultChecked label="Option A" name="playground-radio" />
              <Radio label="Option B" name="playground-radio" size="xs" />
              <Switch defaultChecked label="Active" />
              <Switch label="Left label" labelPosition="left" size="xs" />
            </div>
          </div>
        </ComponentTile>

        <ComponentTile title="Segmented control">
          <div className="component-playground-stack">
            <SegmentedControl
              defaultValue="today"
              options={[
                { label: "Сегодня", value: "today" },
                { label: "Неделя", value: "week" },
                { label: "Месяц", value: "month" },
                { label: "Год", value: "year" },
              ]}
              size="m"
            />
            <SegmentedControl
              defaultValue="home"
              iconOnly
              options={[
                { icon: <Home aria-hidden="true" />, label: "Home", value: "home" },
                { icon: <Bell aria-hidden="true" />, label: "Alerts", value: "alerts" },
                { icon: <Settings aria-hidden="true" />, label: "Settings", value: "settings" },
              ]}
              size="s"
            />
          </div>
        </ComponentTile>
      </PlaygroundSection>

      <PlaygroundSection id="inputs" title="Inputs" description="Поля ввода, select, textarea и card input.">
        <ComponentTile title="Input states">
          <div className="component-playground-grid">
            <Input defaultValue="Значение" label="Label" leftIcon={<Search aria-hidden="true" />} rightIcon={<X aria-hidden="true" />} size="l" />
            <Input hint="Подсказка" label="Medium" placeholder="Placeholder" size="m" />
            <Input counter="12/24" invalid label="Error" placeholder="Ошибка" size="s" />
            <Input disabled label="Disabled" placeholder="Disabled" />
          </div>
        </ComponentTile>

        <ComponentTile title="Select / textarea / card">
          <div className="component-playground-grid">
            <Select defaultOpen defaultValue="verified" label="Select" leftIcon={<Search aria-hidden="true" />} options={selectOptions} />
            <Textarea counter="64/200" defaultValue="Текстовое поле для проверки многострочного ввода." hint="Hint" label="Textarea" size="m" />
            <InputCard defaultValue="2200 0000 0000 0000" hint="Card hint" label="Card number" onClear={() => undefined} />
          </div>
        </ComponentTile>
      </PlaygroundSection>

      <PlaygroundSection title="Menus and Navigation" description="Dropdown, breadcrumbs, tooltip и chips.">
        <ComponentTile title="Dropdown">
          <Dropdown
            bottomPanel={<FunctionButton icon={<Settings aria-hidden="true" />}>Settings</FunctionButton>}
            scroll
            topPanel={<Input leftIcon={<Search aria-hidden="true" />} placeholder="Search" size="s" />}
          >
            <DropdownGroupTitle>Group title</DropdownGroupTitle>
            <DropdownItem icon={<Mail aria-hidden="true" />} selected>
              Item text
            </DropdownItem>
            <DropdownItem hint="Hint" icon={<Info aria-hidden="true" />}>
              Item with hint
            </DropdownItem>
            <DropdownItem multiselect selected>
              Multiselect
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem disabled>Disabled</DropdownItem>
          </Dropdown>
        </ComponentTile>

        <ComponentTile title="Navigation pieces">
          <div className="component-playground-stack">
            <Breadcrumbs
              defaultMenuOpen
              hiddenItems={[{ label: "Hidden 1" }, { label: "Hidden 2" }]}
              items={[{ href: "/", label: "Главная" }, { label: "Компоненты" }, { current: true, label: "Playground" }]}
            />
            <div className="component-playground-row">
              <Chip actionIcon={<ChipDismissIcon aria-hidden="true" />} icon={<Heart aria-hidden="true" />} selected>
                Chips
              </Chip>
              <Chip variant="secondary">Secondary</Chip>
              <Chip disabled>Disabled</Chip>
            </div>
            <Tooltip defaultOpen placement="bottom-center" subtitle="Subtitle" title="Tooltip">
              <Button size="s" variant="outline">
                Hover me
              </Button>
            </Tooltip>
          </div>
        </ComponentTile>
      </PlaygroundSection>

      <PlaygroundSection id="feedback" title="Feedback" description="Toast и inline notification.">
        <div className="component-playground-feedback">
          {(["info", "success", "warning", "error"] as const).map((colorScheme) => (
            <Toast
              actions={notificationActions}
              colorScheme={colorScheme}
              key={`toast-${colorScheme}`}
              subtitle="Subtitle"
              title="Header"
            />
          ))}
          {(["info", "success", "warning", "error"] as const).map((colorScheme) => (
            <InlineNotification
              actions={notificationActions}
              colorScheme={colorScheme}
              key={`inline-${colorScheme}`}
              subtitle="Subtitle"
              title="Title"
            />
          ))}
        </div>
      </PlaygroundSection>
    </main>
  );
}
