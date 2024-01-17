document.addEventListener('DOMContentLoaded', async function () {
    const links = document.querySelectorAll('a');
    const imageLoadedMap = new Map();

    // Preload all links
    links.forEach(link => preloadLink(link));

    tippy('a', {
      allowHTML: true,
      placement: 'right-end',
      inlinePositioning: true,
      content: 'Loading...',
      onShow(instance) {
        const link = instance.reference;
        const linkHref = link.href;

        if (!imageLoadedMap.has(linkHref) || !imageLoadedMap.get(linkHref)) {
          markLinkAsVisited(link);

          tryGetOGImage(linkHref).then((imageUrl) => {
            if (imageUrl) {
              instance.setContent(`<img src="${imageUrl}" alt="Preview Image" width="200" height="200">`);
              imageLoadedMap.set(linkHref, true);
            } else {
              instance.setContent('Image not found');
            }
          });
        }
      },
    });

    function preloadLink(link) {
      const linkHref = link.href;
      if (linkHref) {
        tryGetOGImage(linkHref);
      }
    }

    function markLinkAsVisited(link) {
      link.classList.add('visited');
    const style = document.createElement('style');
  style.textContent = `
    .visited {
      color: purple; /* Set your desired styles for visited links */
      text-decoration: underline; /* Add any additional styles */
    }
  `;
  document.head.appendChild(style);
    }

    async function tryGetOGImage(url) {
      try {
        const imageUrl = await getOGImage(url);
        if (imageUrl) {
          return imageUrl;
        }
        if (isImageUrl(url)) {
          return url;
        }
        else {
          return getOGImageFromJsAction(url);
        }
      } catch (error) {
        console.error('Error fetching OG image:', error);
        return null;
      }
    }

    async function getOGImage(url) {
      const response = await fetch(url);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const ogImage = doc.querySelector('meta[property="og:image"]');
      return ogImage ? ogImage.getAttribute('content') : null;
    }

    async function getOGImageFromJsAction(url) {
      try {
        const response = await fetch(url);
        const pageHtml = await response.text();
        const pageDoc = new DOMParser().parseFromString(pageHtml, 'text/html');
        const targetImg = pageDoc.querySelector('img.sFlh5c.pT0Scc[jsaction="VQAsE"]');
        if (targetImg) {
          const targetImgSrc = targetImg.getAttribute('src');
          return targetImgSrc;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Error fetching OG image from jsaction:', error);
        return null;
      }
    }

    function isImageUrl(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    }
  });
