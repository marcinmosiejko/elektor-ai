import { component$, useContext } from "@builder.io/qwik";
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
          return (
            <div class="flex flex-col gap-1" key={doc.pageContent.slice(0, 20)}>
              <span class="text-xs text-teal-500">
                <span>{chapterName}</span>
                {chapterName && pageNumber && " · "}
                <span>s. {pageNumber}</span>
              </span>
              <div class="font-light">{doc.pageContent}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
