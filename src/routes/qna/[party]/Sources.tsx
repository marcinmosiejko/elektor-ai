import { component$, useContext } from "@builder.io/qwik";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import { QnAContext } from "~/context/qna";

export default component$(() => {
  const { contextDocs } = useContext(QnAContext);

  if (!contextDocs.length) return null;

  return (
    <div>
      <p class="text-md mb-4 text-lg font-medium">Fragmenty źródłowe</p>
      <div class="flex flex-col gap-8 text-sm">
        {contextDocs.map((doc) => {
          const pageNumber = doc.metadata.pageNumber;
          const chapterName = doc.metadata.chapterName.toUpperCase();
          const pageContent =
            doc.pageContent.split("###")[1] || doc.pageContent;

          const markdown = marked.parse(pageContent);
          const sanitisedMarkdown = DOMPurify.sanitize(markdown);
          return (
            <div class="flex flex-col gap-1" key={pageContent.slice(0, 20)}>
              <span class="text-xs text-teal-500">
                <span>{chapterName}</span>
                {chapterName && pageNumber ? " · " : null}
                {pageNumber ? <span>s. {pageNumber}</span> : null}
              </span>
              <div
                dangerouslySetInnerHTML={sanitisedMarkdown}
                class="font-light prose prose-sm leading-5 max-w-none"
                style={{ width: "100%" }}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
