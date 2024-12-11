import { marked } from "marked";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import ImageWithLoading from "@/components/ImageWithLoading";
import toast from "react-hot-toast";

import { db, auth } from "@/firebase";
import { getDoc, doc } from "firebase/firestore";

function processHtmlToCustomHtml(html) {
  let modifiedHTML = processTableClosingTag(html);
  modifiedHTML = processTableOpeningTag(modifiedHTML);
  modifiedHTML = processOlClass(modifiedHTML);
  modifiedHTML = convertMarkdownInLi(modifiedHTML);
  modifiedHTML = replaceArrow(modifiedHTML);
  return modifiedHTML;
}
function processTableOpeningTag(html) {
  return html.replace(
    /<table>/g,
    '<div class="table-holder"><table class="table">'
  );
}
function processTableClosingTag(html) {
  return html.replace(/<\/table>/g, "</table></div>");
}
function processOlClass(html) {
  return html.replace(
    /<ol class=""upper-alpha"">/g,
    '<ol class="upper-alpha">'
  );
}
function replaceArrow(html) {
  return html.replace(
    /-&gt;/g,
    '<svg style="display:inline-block; width: 18px; height: 18px" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg"><path d="M13.22 19.03a.75.75 0 0 1 0-1.06L18.19 13H3.75a.75.75 0 0 1 0-1.5h14.44l-4.97-4.97a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0Z"></path></svg>'
  );
}

function convertMarkdownInLi(text) {
  // Define the replacements for bold and italic within <li> tags
  const boldPattern = /\*\*(.*?)\*\*/g; // Matches **text**
  const italicPattern = /_(.*?)_/g; // Matches _text_

  // Find all <li> tags and replace the content inside them
  return text.replace(
    /(<li[^>]*>)([\s\S]*?)(<\/li>)/g,
    (match, openingTag, content, closingTag) => {
      // Replace **text** with <strong>text</strong> and _text_ with <em>text</em>
      const processedContent = content
        .replace(boldPattern, "<strong>$1</strong>")
        .replace(italicPattern, "<em>$1</em>");
      return `${openingTag}${processedContent}${closingTag}`;
    }
  );
}

const processQuestionToHtml = (Question) => {
  return processHtmlToCustomHtml(marked.parse(String(Question)));
};

import styleToObject from "style-to-object";

const parseHtml = (html) => {
  return parse(html, {
    replace: (domNode) => {
      if (domNode.name === "img" && domNode.attribs) {
        let maxWidth = "100%"; // Default value

        try {
          const style = styleToObject(domNode.attribs.style || "") || {};
          if (style["max-width"]) {
            maxWidth = style["max-width"];
          }
        } catch (error) {
          console.error("Failed to parse style:", error);
        }

        return (
          <ImageWithLoading
            maxW={maxWidth}
            src={domNode.attribs.src}
            alt={domNode.attribs.alt || ""}
          />
        );
      }
      return domNode;
    },
  });
};

const fetchPapers = async () => {
  try {
    const papersRef = doc(db, "brief_det", "papers");
    const papersSnap = await getDoc(papersRef);
    if (papersSnap.exists()) {
      const papersSnapData = papersSnap.data().data;
      console.log("papersSnapData", papersSnapData);
      const sortedEntries = Object.entries(papersSnapData).sort(
        (a, b) => b[1].yr - a[1].yr
      );
      const transformedEntries = sortedEntries.map(([key, value]) => ({
        key,
        ...value,
      }));

      const getUniqueYears = (papers) => {
        const years = papers.map((paper) => paper.yr);
        const uniqueYears = [...new Set(years)];

        return uniqueYears;
      };
      const years = getUniqueYears(transformedEntries);
      return [transformedEntries, years];
    }
  } catch (error) {
    toast.error(`Error fetching papers: ${error.message}`);
  }
};
export { processQuestionToHtml, parseHtml, fetchPapers };
