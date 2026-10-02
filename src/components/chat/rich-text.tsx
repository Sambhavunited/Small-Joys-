import { Fragment, type ReactNode } from "react";

// A tiny, safe renderer for the assistant's replies: paragraphs, line breaks,
// bullet or numbered lists and **bold**. No HTML is ever injected.

function inline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*\n]+\*\*$/.test(part)) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{part.replace(/\*\*/g, "")}</Fragment>;
  });
}

const BULLET = /^\s*(?:[-•*]|\d+[.)])\s+/;

export function RichText({ text }: { text: string }) {
  const blocks = text
    .replace(/\r/g, "")
    .trim()
    .split(/\n{2,}/);
  const out: ReactNode[] = [];
  blocks.forEach((block, bi) => {
    const lines = block.split("\n");
    let para: string[] = [];
    let list: string[] = [];
    let ordered = false;
    const flushPara = () => {
      if (!para.length) return;
      const k = `p${bi}-${out.length}`;
      out.push(
        <p key={k}>
          {para.map((line, li) => (
            <Fragment key={li}>
              {li > 0 ? <br /> : null}
              {inline(line, `${k}-${li}`)}
            </Fragment>
          ))}
        </p>,
      );
      para = [];
    };
    const flushList = () => {
      if (!list.length) return;
      const k = `l${bi}-${out.length}`;
      const items = list.map((item, li) => <li key={li}>{inline(item, `${k}-${li}`)}</li>);
      out.push(
        ordered ? (
          <ol key={k} className="list-decimal pl-5">
            {items}
          </ol>
        ) : (
          <ul key={k}>{items}</ul>
        ),
      );
      list = [];
    };
    for (const line of lines) {
      if (BULLET.test(line)) {
        flushPara();
        if (!list.length) ordered = /^\s*\d/.test(line);
        list.push(line.replace(BULLET, ""));
      } else if (line.trim()) {
        flushList();
        para.push(line.trim());
      }
    }
    flushPara();
    flushList();
  });
  return <div className="prose-chat">{out}</div>;
}
