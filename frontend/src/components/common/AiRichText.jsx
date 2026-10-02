function InlineText({
  text,
}) {
  const value =
    String(text || "");

  const parts =
    value
      .split(
        /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`)/g
      )
      .filter(Boolean);

  return (
    <>
      {parts.map(
        (
          part,
          index
        ) => {
          if (
            part.startsWith("**") &&
            part.endsWith("**")
          ) {
            return (
              <strong key={index}>
                {part.slice(2, -2)}
              </strong>
            );
          }

          if (
            part.startsWith("*") &&
            part.endsWith("*")
          ) {
            return (
              <em key={index}>
                {part.slice(1, -1)}
              </em>
            );
          }

          if (
            part.startsWith("_") &&
            part.endsWith("_")
          ) {
            return (
              <em key={index}>
                {part.slice(1, -1)}
              </em>
            );
          }

          if (
            part.startsWith("`") &&
            part.endsWith("`")
          ) {
            return (
              <code key={index}>
                {part.slice(1, -1)}
              </code>
            );
          }

          return (
            <span key={index}>
              {part}
            </span>
          );
        }
      )}
    </>
  );
}


function parseAiText(text) {
  const lines =
    String(text || "")
      .replace(/\r\n/g, "\n")
      .split("\n");

  const blocks = [];

  let orderedCounter = 0;

  lines.forEach(
    (
      rawLine,
      index
    ) => {
      const line =
        rawLine.trim();

      if (!line) {
        return;
      }

      if (
        /^-{3,}$/.test(line)
      ) {
        orderedCounter = 0;

        blocks.push({
          type: "hr",
          key: index,
        });

        return;
      }

      const heading =
        line.match(
          /^(#{1,6})\s+(.+)$/
        );

      if (heading) {
        orderedCounter = 0;

        blocks.push({
          type: "heading",
          key: index,
          level:
            heading[1].length,
          text:
            heading[2],
        });

        return;
      }

      const numbered =
        line.match(
          /^(\d+)\.\s+(.+)$/
        );

      if (numbered) {
        const sourceNumber =
          Number(numbered[1]);

        if (
          orderedCounter === 0
        ) {
          orderedCounter =
            sourceNumber;
        } else if (
          sourceNumber >
          orderedCounter
        ) {
          orderedCounter =
            sourceNumber;
        } else {
          orderedCounter += 1;
        }

        blocks.push({
          type: "numbered",
          key: index,
          number:
            orderedCounter,
          text:
            numbered[2],
        });

        return;
      }

      const bullet =
        line.match(
          /^[-*]\s+(.+)$/
        );

      if (bullet) {
        blocks.push({
          type: "bullet",
          key: index,
          text:
            bullet[1],
        });

        return;
      }

      blocks.push({
        type: "paragraph",
        key: index,
        text: line,
      });
    }
  );

  return blocks;
}


export default function AiRichText({
  text = "",
}) {
  const blocks =
    parseAiText(text);

  return (
    <div className="ai-rich-text">
      {blocks.map(
        (block) => {
          if (
            block.type ===
            "heading"
          ) {
            const Tag =
              block.level <= 2
                ? "h3"
                : "h4";

            return (
              <Tag key={block.key}>
                <InlineText
                  text={block.text}
                />
              </Tag>
            );
          }

          if (
            block.type ===
            "numbered"
          ) {
            return (
              <div
                className="ai-numbered-line"
                key={block.key}
              >
                <span className="ai-number">
                  {block.number}.
                </span>

                <span>
                  <InlineText
                    text={block.text}
                  />
                </span>
              </div>
            );
          }

          if (
            block.type ===
            "bullet"
          ) {
            return (
              <div
                className="ai-bullet-line"
                key={block.key}
              >
                <span className="ai-bullet">
                  •
                </span>

                <span>
                  <InlineText
                    text={block.text}
                  />
                </span>
              </div>
            );
          }

          if (
            block.type ===
            "hr"
          ) {
            return (
              <hr key={block.key} />
            );
          }

          return (
            <p key={block.key}>
              <InlineText
                text={block.text}
              />
            </p>
          );
        }
      )}
    </div>
  );
}
