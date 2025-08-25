document.addEventListener("DOMContentLoaded", function () {
  const siteUrl = "https://beacon2.fcsia.com";

  const spotlights = [
    { id: "student-spotlight", tag: "student_spotlight", imagePosition: "right" },
    { id: "teacher-spotlight", tag: "teacher_spotlight", imagePosition: "right" },
    { id: "partner-spotlight", tag: "partner_spotlight", imagePosition: "right" }
  ];

  function getTagIdBySlug(slug) {
    return fetch(`${siteUrl}/wp-json/wp/v2/tags?slug=${slug}`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => {
        if (data.length > 0) return data[0].id;
        throw new Error(`Tag "${slug}" not found`);
      });
  }

  function stripHTML(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  function truncateWords(text, numWords) {
    return text.split(/\s+/).slice(0, numWords).join(" ") + "...";
  }

  function loadSpotlight(spotlight) {
    const container = document.querySelector(`#${spotlight.id} .spotlight-content`);
    if (!container) {
      console.error(`Element with id "${spotlight.id}" not found.`);
      return;
    }

    const postsToFetch = spotlight.pickFromLatest || 1;

    getTagIdBySlug(spotlight.tag)
      .then(tagId => fetch(`${siteUrl}/wp-json/wp/v2/posts?per_page=${postsToFetch}&tags=${tagId}&_embed`))
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(posts => {
        if (!posts.length) throw new Error(`No posts found for tag "${spotlight.tag}"`);

        const post = posts[Math.floor(Math.random() * posts.length)];
        let imgHtml = "";

        if (post._embedded?.["wp:featuredmedia"]?.[0]) {
          const imgUrl = post._embedded["wp:featuredmedia"][0].source_url;
          imgHtml = `
            <div style="float: ${spotlight.imagePosition}; margin: 0 0 1em 1em; max-width: 150px;">
              <img src="${imgUrl}" alt="Featured Image" style="width: 100%;">
            </div>`;
        }

        container.innerHTML = `
          <h4>${post.title.rendered}</h4>
          ${imgHtml}
          <p>${truncateWords(stripHTML(post.excerpt.rendered), 100)}</p>
          <button class="more-button" data-full-content='${post.content.rendered.replace(/'/g, "&#39;")}'>More</button>
        `;
      })
      .catch(err => {
        console.error(`Error fetching ${spotlight.tag}:`, err);
        container.innerHTML = `<p>Error loading spotlight content.</p>`;
      });
  }

  spotlights.forEach(loadSpotlight);
});
