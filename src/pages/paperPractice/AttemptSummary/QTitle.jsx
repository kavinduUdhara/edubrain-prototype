import React, { useState, useEffect, useRef } from 'react';
import { BsArrowsAngleExpand, BsArrowsCollapse } from 'react-icons/bs';
import parseHtml from 'html-react-parser';

const QTitle = ({ question }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasImages, setHasImages] = useState(false);
  const qTxtRef = useRef(null);

  // Function to check if the content overflows
  const checkOverflow = () => {
    if (qTxtRef.current) {
      setIsOverflowing(qTxtRef.current.scrollHeight > qTxtRef.current.clientHeight || parseFloat(getComputedStyle(qTxtRef.current).maxHeight) == 1000);
    }
  };

  // Function to check for images in the content
  const checkForImages = () => {
    if (qTxtRef.current) {
      const images = qTxtRef.current.querySelectorAll('img');
      setHasImages(images.length > 0);
    }
  };

  // Check overflow and images after the component mounts and whenever the question changes
  useEffect(() => {
    checkOverflow();
    checkForImages();
    window.addEventListener('resize', checkOverflow);

    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [question]);

  // Re-check overflow and images when images are loaded
  useEffect(() => {
    const handleImageLoad = () => {
      checkOverflow();
    };

    if (qTxtRef.current) {
      const images = qTxtRef.current.querySelectorAll('img');
      images.forEach((img) => {
        img.addEventListener('load', handleImageLoad);
        img.addEventListener('error', handleImageLoad);
      });

      return () => {
        images.forEach((img) => {
          img.removeEventListener('load', handleImageLoad);
          img.removeEventListener('error', handleImageLoad);
        });
      };
    }
  }, [question]);

  // Add the sm-q-no div into the first h1 inside q-txt
  useEffect(() => {
    if (qTxtRef.current) {
      const h1 = qTxtRef.current.querySelector('h1');
      if (h1 && !h1.querySelector('.sm-q-no')) {
        // Create a new div element with the required class and content
        const smQNoDiv = document.createElement('div');
        smQNoDiv.className = 'sm-q-no';
        smQNoDiv.textContent = "" + question.q_id.slice(-2) + " "; // Add the last two characters of q_id
  
        // Insert the new div before the text content in the h1
        h1.insertBefore(smQNoDiv, h1.firstChild); // Insert at the beginning
      }
    }
  }, [question]);
  

  return (
    <div className={`q-txt-holder ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div
        className={`q-txt ${isExpanded ? 'expanded' : 'collapsed'}`}
        ref={qTxtRef}
      >
        {parseHtml(String(question.q_title))}
      </div>
      {(isOverflowing || hasImages) && (
        <button className="expand-btn" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <BsArrowsCollapse /> : <BsArrowsAngleExpand />}
          {isExpanded ? '' : 'Expand'}
        </button>
      )}
    </div>
  );
};

export default QTitle;

