document.addEventListener("DOMContentLoaded", function () {
  const celebrationsContainer = document.querySelector("#celebrations .celebrations-content");
  const siteUrl = "https://beacon2.fcsia.com";
  const primaryTag = "celebrate";
  const requiredTag = "marquee";
  const postsToFetch = 20; // fetch more, then filter

  // Get the ID of a tag by its slug
  function getTagId(slug) {
    return fetch(`${siteUrl}/wp-json/wp/v2/tags?slug=${slug}`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => {
        if (data.length > 0) return data[0].id;
        throw new Error(`Tag "${slug}" not found`);
      });
  }

  Promise.all([getTagId(primaryTag), getTagId(requiredTag)])
    .then(([primaryTagId, requiredTagId]) => {
      // Fetch posts tagged with the primary tag
      return fetch(`${siteUrl}/wp-json/wp/v2/posts?per_page=${postsToFetch}&tags=${primaryTagId}&_embed`)
        .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
        .then(posts => {
          // Filter posts that also have the required "marquee" tag
          return posts.filter(post => post.tags.includes(requiredTagId));
        });
    })
    .then(filteredPosts => {
      if (!filteredPosts.length) throw new Error("No celebrations with both tags found.");

      // Show up to 4 short celebration items (image + title)
      const celebrationsHtml = filteredPosts.slice(0, 4).map(post => {
        const imgUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || '';
        return `
          <div class="celebration-item">
            ${imgUrl ? `<img src="${imgUrl}" alt="Celebration Image">` : ''}
            <div class="celebration-title">${post.title.rendered}</div>
          </div>
          <hr class="celebration-divider">
        `;
      }).join('');

      celebrationsContainer.innerHTML = celebrationsHtml;
    })
    .catch(err => {
      console.error("Error fetching celebrations:", err);
      celebrationsContainer.innerHTML = `<p>Error loading celebrations.</p>`;
    });
});
