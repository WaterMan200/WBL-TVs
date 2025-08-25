document.addEventListener("DOMContentLoaded", function () {
  const instagramContainer = document.getElementById("instagram-posts");

  if (!instagramContainer) {
    console.error('Element with id "instagram-posts" not found.');
    return;
  }

  // Replace with your Instagram Basic Display API access token
  const accessToken = "YOUR_INSTAGRAM_ACCESS_TOKEN";
  // Endpoint to get media data (adjust the fields as needed)
  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp,username&access_token=${accessToken}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (data && data.data && data.data.length > 0) {
        // Limit the number of posts to 5
        const posts = data.data.slice(0, 5);
        let postsHtml = "<h3>Instagram Feed</h3>";

        posts.forEach(post => {
          postsHtml += `
            <div class="instagram-post" style="margin-bottom: 1em;">
              <a href="${post.permalink}" target="_blank">
                <img src="${post.media_url}" alt="${post.caption ? post.caption : 'Instagram post'}" style="max-width: 100%; height: auto;">
              </a>
              <p>${post.caption ? post.caption : ""}</p>
              <br>
            </div>
          `;
        });
        instagramContainer.innerHTML = postsHtml;
      } else {
        instagramContainer.innerHTML = "<p>No Instagram posts found.</p>";
      }
    })
    .catch(error => {
      console.error("Error fetching Instagram posts:", error);
      instagramContainer.innerHTML = "<p>Error loading Instagram posts.</p>";
    });
});
