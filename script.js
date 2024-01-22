let API_LINK = 'https://api.github.com/users';
let search_btn = document.querySelector(".search");
let search_term = document.getElementById("search-term");
let repoUl = document.getElementById("repo");
let perPage = 10; // Number of repositories per page

let searching = document.querySelector(".searching");
let selectedPerPage = perPage;
search_term.focus();
let userDetaile; // Store user details
let repo = []; // Store repositories
let currentPage = 1;

search_btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (search_term.value) {
        searching.innerHTML = 'Searching...';
        setTimeout(() => {
            getUserDetaile(`${API_LINK}/${search_term.value}`);
        }, 2000);
        setTimeout(() => {
            getRepoDetaile(`${API_LINK}/${search_term.value}/repos?per_page=${perPage}&page=${currentPage}`);
        }, 1000);
    } else {
        alert('Please enter any GitHub username');
        search_term.focus();
    }
});

// Function to show user Data on screen
function showUserDetails(data) {
    var box = document.querySelector(".box-body");
    var j = ``;
    repo.forEach((e) => {
        j += `<a href="${e.html_url}" target="_blank">
        <li>
            <div>
                <h4>${e.name}</h4>
                <p><strong>Description:</strong>${e.description || 'No description available'}</p>
                <p><strong>Topics:</strong> ${e.topics.join(', ') || 'No topics available'}</p>
            </div>
        </li>
    </a>`;
    });
    searching.innerHTML = "";

    const totalPages = Math.ceil(data.public_repos / perPage);

    box.innerHTML = (`
    <div class="profile-box">
    <div class="row">
        <div class="image">
            <img src="${data.avatar_url}" alt="">
        </div>
       <div class="about">
        <div class="details">
            <h1 class="name">${data.name}</h1>
            <h3 class="username">@${data.login}</h3>
            <p class="country"><span><ion-icon name="location-sharp"></ion-icon></span>${data.location === null ? 'Unknown' : data.location}</p>
        </div>
        <div class="btn-profile">
            <a href="${data.html_url}" target="_blank">Visit Profile</a>
        </div>
       </div>
    </div>
    <div class="bio">
        <h3>About</h3>
        <p>${data.bio === null ? 'Bio description is unavailable' : data.bio}</p>
    </div>
    <div class="row-followers">
        <div class="col">
            <h3 class="heading">
                Followers
            </h3>
            <p>${data.followers}</p>
        </div>
        <div class="col">
            <h3 class="heading">
                Following
            </h3>
            <p>${data.following}</p>
        </div>
        <div class="col">
            <h3 class="heading">
                Repos
            </h3>
            <p>${data.public_repos}</p>
        </div>
    </div>
    <h3 class="repo-heading">Repositories 
    <select class="repositories-per-page" id="repositoriesPerPage" onchange="updatePerPage()">
    <option value="10" ${selectedPerPage === 10 ? 'selected' : ''}>10</option>
    <option value="25" ${selectedPerPage === 25 ? 'selected' : ''}>25</option>
    <option value="50" ${selectedPerPage === 50 ? 'selected' : ''}>50</option>
    <option value="100" ${selectedPerPage === 100 ? 'selected' : ''}>100</option>
    </select>
    </h3>
    <div class="respos-row">
        <ul id="repo">
        ${j}
        </ul>
    </div>
    <div class="pagination">
        <button onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page: ${currentPage} of ${totalPages}</span>
        <button onclick="changePage(1)">Next</button>
    </div>
</div>
    `);
}

// Fetching user details
async function getUserDetaile(api) {
    let query = await fetch(api)
        .then(async (query) => {
            return await query.json();
        }).then((result) => {
            if (result.name == null) {
                alert("User not found");
                location.reload();
            } else {
                userDetaile = result;
                showUserDetails(result);
            }
        }).catch((error) => {
            console.log(error);
        });
}

// Function to get repositories link
async function getRepoDetaile(repi_api) {
    let repo_query = await fetch(repi_api)
        .then(async (repo_query) => {
            return await repo_query.json();
        }).then((repo_result) => {
            repo = repo_result.map(repo => ({
                name: repo.name,
                html_url: repo.html_url,
                description: repo.description,
                topics: repo.topics || [], // Assuming topics is an array
            }));
            showUserDetails(userDetaile);
        }).catch((repo_error) => {
            console.log(repo_error);
        });
}


// Function to change the current page
function changePage(change) {
    const newPage = currentPage + change;

    // Check if the new page is within valid bounds
    if (newPage >= 1 && newPage <= Math.ceil(userDetaile.public_repos / perPage)) {
        currentPage = newPage;
        getRepoDetaile(`${API_LINK}/${search_term.value}/repos?per_page=${perPage}&page=${currentPage}`);
        
        // Disable the "Next" button if on the last page
        const nextButton = document.querySelector('.pagination button:last-child');
        nextButton.disabled = currentPage * perPage >= userDetaile.public_repos;
    }
}

function updatePerPage() {
    selectedPerPage = parseInt(document.getElementById("repositoriesPerPage").value, 10);
    perPage = selectedPerPage;
    currentPage = 1; // Reset to the first page when changing repositories per page
    getRepoDetaile(`${API_LINK}/${search_term.value}/repos?per_page=${perPage}&page=${currentPage}`);
}