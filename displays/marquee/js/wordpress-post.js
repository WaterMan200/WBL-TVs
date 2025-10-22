document.addEventListener("DOMContentLoaded", function () {
  const postContainer = document.getElementById("wordpress-post");

  if (!postContainer) {
    console.error('Element with id "wordpress-post" not found.');
    return;
  }

  const tagSlug = "feature";
  const siteUrl = "https://beacon2.fcsia.com";

  function getTagIdBySlug(slug) {
    const tagUrl = `${siteUrl}/wp-json/wp/v2/tags?slug=${slug}`;
    return fetch(tagUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch tag by slug: " + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          return data[0].id;
        } else {
          throw new Error("No tag found for slug: " + slug);
        }
      });
  }

  function stripHTML(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  }

  function truncateWords(text, numWords) {
    const words = text.split(/\s+/);
    if (words.length <= numWords) {
      return text;
    }
    return words.slice(0, numWords).join(" ") + "...";
  }

  getTagIdBySlug(tagSlug)
    .then(tagId => {
      const wpUrl = `${siteUrl}/wp-json/wp/v2/posts?per_page=1&tags=${tagId}&_embed`;
      return fetch(wpUrl);
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (data && data.length > 0) {
        const post = data[0];
        let imageHtml = "";

        if (
          post._embedded &&
          post._embedded["wp:featuredmedia"] &&
          post._embedded["wp:featuredmedia"][0]
        ) {
          const imageUrl = post._embedded["wp:featuredmedia"][0].source_url;
          imageHtml = `
            <div class="module-pic-container" style="float: right; margin-left: 1em;">
              <img src="${imageUrl}" alt="Featured Image" style="width: 100%;">
            </div>
          `;
        }

        let rawText = "";
        if (post.excerpt && post.excerpt.rendered) {
          rawText = stripHTML(post.excerpt.rendered).trim();
        }
        if (!rawText && post.content && post.content.rendered) {
          rawText = stripHTML(post.content.rendered).trim();
        }
        let truncatedExcerpt = truncateWords(rawText, 100);

        // Build output and include a More button.
        postContainer.innerHTML = `
          <h3>${post.title.rendered}</h3>
          ${imageHtml}
          <p>${truncatedExcerpt}</p>
          <button class="more-button" data-full-content='${post.content.rendered.replace(/'/g, "&#39;")}'>More</button>
        `;
      } else {
        postContainer.innerHTML = "<p>No posts found with this tag.</p>";
      }
    })
    .catch(error => {
      console.error("Error fetching WordPress post:", error);
      postContainer.innerHTML = "<p>Error loading post.</p>";
    });
});
