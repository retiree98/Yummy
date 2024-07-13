// Constants
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const rowData = document.getElementById("rowData");
const searchContainer = document.getElementById("searchContainer");
const sideNav = document.querySelector(".side-nav");
const openCloseIcon = document.querySelector(".open-close-icon");

// Utility functions
const showLoader = () => $(".inner-loader").fadeIn(300);
const hideLoader = () => $(".inner-loader").fadeOut(300);

const fetchData = async (url) => {
    showLoader();
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    } finally {
        hideLoader();
    }
};

// Template functions
const categoryTemplate = (category) => `
    <div class="col-md-3">
        <div onclick="getMeals('${category.strCategory}', 'c')" class="meal position-relative overflow-hidden rounded-2 cursor-pointer">
            <img class="w-100" src="${category.strCategoryThumb}" alt="${category.strCategory}">
            <div class="meals position-absolute text-center text-black p-2">
                <h3>${category.strCategory}</h3>
                <p>${category.strCategoryDescription.split(" ").slice(0,20).join(" ")}</p>
            </div>
        </div>
    </div>
`;

const mealTemplate = (meal) => `
    <div class="col-md-3">
        <div onclick="getMealDetails('${meal.idMeal}')" class="meal position-relative overflow-hidden rounded-2 cursor-pointer">
            <img class="w-100" src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="meals position-absolute d-flex align-items-center text-black p-2">
                <h3>${meal.strMeal}</h3>
            </div>
        </div>
    </div>
`;

const areaTemplate = (area) => `
    <div class="col-md-3">
        <div onclick="getMeals('${area.strArea}', 'a')" class="rounded-2 text-center cursor-pointer">
            <i class="fa-solid fa-house-laptop fa-4x"></i>
            <h3>${area.strArea}</h3>
        </div>
    </div>
`;

const ingredientTemplate = (ingredient) => `
    <div class="col-md-3">
        <div onclick="getMeals('${ingredient.strIngredient}', 'i')" class="rounded-2 text-center cursor-pointer">
            <i class="fa-solid fa-drumstick-bite fa-4x"></i>
            <h3>${ingredient.strIngredient}</h3>
            <p>${ingredient.strDescription?.split(" ").slice(0,20).join(" ") || ""}</p>
        </div>
    </div>
`;

const mealDetailsTemplate = (meal) => {
    const ingredients = Array.from({length: 20}, (_, i) => i + 1)
        .map(i => meal[`strIngredient${i}`] ? `<li class="alert alert-info m-2 p-1">${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}</li>` : '')
        .join('');

    const tags = meal.strTags?.split(",").map(tag => `<li class="alert alert-danger m-2 p-1">${tag}</li>`).join('') || '';

    return `
    <div class="col-md-4">
        <img class="w-100 rounded-3" src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h2>${meal.strMeal}</h2>
    </div>
    <div class="col-md-8">
        <h2>Instructions</h2>
        <p>${meal.strInstructions}</p>
        <h3><span class="fw-bolder">Area : </span>${meal.strArea}</h3>
        <h3><span class="fw-bolder">Category : </span>${meal.strCategory}</h3>
        <h3>Recipes :</h3>
        <ul class="list-unstyled d-flex g-3 flex-wrap">
            ${ingredients}
        </ul>
        <h3>Tags :</h3>
        <ul class="list-unstyled d-flex g-3 flex-wrap">
            ${tags}
        </ul>
        <a target="_blank" href="${meal.strSource}" class="btn btn-success">Source</a>
        <a target="_blank" href="${meal.strYoutube}" class="btn btn-danger">Youtube</a>
    </div>`;
};

// Main functions
const getCategories = async () => {
    clearMainContent();
    try {
        const data = await fetchData(`${API_BASE_URL}/categories.php`);
        displayContent(data.categories, categoryTemplate);
    } catch (error) {
        showError('Failed to load categories. Please try again later.');
    }
};

const getAreas = async () => {
    clearMainContent();
    try {
        const data = await fetchData(`${API_BASE_URL}/list.php?a=list`);
        displayContent(data.meals, areaTemplate);
    } catch (error) {
        showError('Failed to load areas. Please try again later.');
    }
};

const getIngredients = async () => {
    clearMainContent();
    try {
        const data = await fetchData(`${API_BASE_URL}/list.php?i=list`);
        displayContent(data.meals.slice(0, 20), ingredientTemplate);
    } catch (error) {
        showError('Failed to load ingredients. Please try again later.');
    }
};

const getMeals = async (term, type) => {
    clearMainContent();
    try {
        const data = await fetchData(`${API_BASE_URL}/filter.php?${type}=${term}`);
        displayContent(data.meals.slice(0, 20), mealTemplate);
    } catch (error) {
        showError('Failed to load meals. Please try again later.');
    }
};

const getMealDetails = async (mealId) => {
    clearMainContent();
    closeSideNav();
    try {
        const data = await fetchData(`${API_BASE_URL}/lookup.php?i=${mealId}`);
        rowData.innerHTML = mealDetailsTemplate(data.meals[0]);
    } catch (error) {
        showError('Failed to load meal details. Please try again later.');
    }
};

const searchMeals = async (searchTerm, searchType) => {
    // Don't clear the search inputs
    rowData.innerHTML = "";
    try {
        const data = await fetchData(`${API_BASE_URL}/search.php?${searchType}=${searchTerm}`);
        displayContent(data.meals || [], mealTemplate);
    } catch (error) {
        showError('Failed to perform search. Please try again later.');
    }
};
// Helper functions
const clearMainContent = () => {
    rowData.innerHTML = "";
    searchContainer.innerHTML = "";
};

const displayContent = (items, templateFunc) => {
    rowData.innerHTML = items.map(templateFunc).join('');
};

const showError = (message) => {
    rowData.innerHTML = `<p class="text-center text-danger">${message}</p>`;
};

// Navigation functions
const openSideNav = () => {
    $(sideNav).animate({ left: 0 }, 500);
    openCloseIcon.classList.replace("fa-align-justify", "fa-x");
    $(".links li").each((i, el) => $(el).animate({ top: 0 }, (i + 5) * 100));
};

const closeSideNav = () => {
    const boxWidth = $(".side-nav .nav-tab").outerWidth();
    $(sideNav).animate({ left: -boxWidth }, 500);
    openCloseIcon.classList.replace("fa-x", "fa-align-justify");
    $(".links li").animate({ top: 300 }, 500);
};

// Event listeners
openCloseIcon.addEventListener("click", () => {
    if ($(sideNav).css("left") == "0px") {
        closeSideNav();
    } else {
        openSideNav();
    }
});

// Search 
const showSearchInputs = () => {
    searchContainer.innerHTML = `
    <div class="row py-4 ">
        <div class="col-md-6 ">
            <input id="searchByName" class="form-control bg-transparent text-white" type="text" placeholder="Search By Name">
        </div>
        <div class="col-md-6">
            <input id="searchByFirstLetter" maxlength="1" class="form-control bg-transparent text-white" type="text" placeholder="Search By First Letter">
        </div>
    </div>`;
    rowData.innerHTML = "";

    // Add event listeners to search inputs
    document.getElementById('searchByName').addEventListener('input', function() {
        searchMeals(this.value, 's');
    });

    document.getElementById('searchByFirstLetter').addEventListener('input', function() {
        if (this.value.length > 0) {
            searchMeals(this.value[0], 'f');
        }
    });
};

// Contact form validation
function showContacts() {
    rowData.innerHTML = `<div class="contact min-vh-100 d-flex justify-content-center align-items-center">
    <div class="container w-75 text-center">
        <div class="row g-4">
            <div class="col-md-6">
                <input id="nameInput" onkeyup="inputsValidation()" type="text" class="form-control" placeholder="Enter Your Name">
                <div id="nameAlert" class="alert alert-danger w-100 mt-2 d-none">
                    Special characters and numbers not allowed
                </div>
            </div>
            <div class="col-md-6">
                <input id="emailInput" onkeyup="inputsValidation()" type="email" class="form-control " placeholder="Enter Your Email">
                <div id="emailAlert" class="alert alert-danger w-100 mt-2 d-none">
                    Email not valid *exemple@yyy.zzz
                </div>
            </div>
            <div class="col-md-6">
                <input id="phoneInput" onkeyup="inputsValidation()" type="text" class="form-control " placeholder="Enter Your Phone">
                <div id="phoneAlert" class="alert alert-danger w-100 mt-2 d-none">
                    Enter valid Phone Number
                </div>
            </div>
            <div class="col-md-6">
                <input id="ageInput" onkeyup="inputsValidation()" type="number" class="form-control " placeholder="Enter Your Age">
                <div id="ageAlert" class="alert alert-danger w-100 mt-2 d-none">
                    Enter valid age
                </div>
            </div>
            <div class="col-md-6">
                <input  id="passwordInput" onkeyup="inputsValidation()" type="password" class="form-control " placeholder="Enter Your Password">
                <div id="passwordAlert" class="alert alert-danger w-100 mt-2 d-none">
                    Enter valid password *Minimum eight characters, at least one letter and one number:*
                </div>
            </div>
            <div class="col-md-6">
                <input  id="repasswordInput" onkeyup="inputsValidation()" type="password" class="form-control " placeholder="Repassword">
                <div id="repasswordAlert" class="alert alert-danger w-100 mt-2 d-none">
                    Enter valid repassword 
                </div>
            </div>
        </div>
        <button id="submitBtn" disabled class="btn btn-outline-danger px-2 mt-3">Submit</button>
    </div>
</div> `
    submitBtn = document.getElementById("submitBtn")


    document.getElementById("nameInput").addEventListener("focus", () => {
        nameInputFocus = true
    })

    document.getElementById("emailInput").addEventListener("focus", () => {
        emailInputFocus = true
    })

    document.getElementById("phoneInput").addEventListener("focus", () => {
        phoneInputFocus = true
    })

    document.getElementById("ageInput").addEventListener("focus", () => {
        ageInputFocus = true
    })

    document.getElementById("passwordInput").addEventListener("focus", () => {
        passwordInputFocus = true
    })

    document.getElementById("repasswordInput").addEventListener("focus", () => {
        repasswordInputFocus = true
    })
}
//  contacts input validation
// inputs validation 
function inputsValidation() {
    if (nameInputFocus) {
        if (nameValidation()) {
            document.getElementById("nameAlert").classList.replace("d-block", "d-none")

        } else {
            document.getElementById("nameAlert").classList.replace("d-none", "d-block")

        }
    }
    if (emailInputFocus) {

        if (emailValidation()) {
            document.getElementById("emailAlert").classList.replace("d-block", "d-none")
        } else {
            document.getElementById("emailAlert").classList.replace("d-none", "d-block")

        }
    }

    if (phoneInputFocus) {
        if (phoneValidation()) {
            document.getElementById("phoneAlert").classList.replace("d-block", "d-none")
        } else {
            document.getElementById("phoneAlert").classList.replace("d-none", "d-block")

        }
    }

    if (ageInputFocus) {
        if (ageValidation()) {
            document.getElementById("ageAlert").classList.replace("d-block", "d-none")
        } else {
            document.getElementById("ageAlert").classList.replace("d-none", "d-block")

        }
    }

    if (passwordInputFocus) {
        if (passwordValidation()) {
            document.getElementById("passwordAlert").classList.replace("d-block", "d-none")
        } else {
            document.getElementById("passwordAlert").classList.replace("d-none", "d-block")

        }
    }
    if (repasswordInputFocus) {
        if (repasswordValidation()) {
            document.getElementById("repasswordAlert").classList.replace("d-block", "d-none")
        } else {
            document.getElementById("repasswordAlert").classList.replace("d-none", "d-block")

        }
    }


    if (nameValidation() &&
        emailValidation() &&
        phoneValidation() &&
        ageValidation() &&
        passwordValidation() &&
        repasswordValidation()) {
        submitBtn.removeAttribute("disabled")
    } else {
        submitBtn.setAttribute("disabled", true)
    }
}
// validate name
function nameValidation() {
    return (/^[a-zA-Z ]+$/.test(document.getElementById("nameInput").value))
}
// validate email
function emailValidation() {
    return (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(document.getElementById("emailInput").value))
}
// validate phone no
function phoneValidation() {
    return (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(document.getElementById("phoneInput").value))
}
// validate age
function ageValidation() {
    return (/^(0?[1-9]|[1-9][0-9]|[1][1-9][1-9]|200)$/.test(document.getElementById("ageInput").value))
}
// validate password
function passwordValidation() {
    return (/^(?=.*\d)(?=.*[a-z])[0-9a-zA-Z]{8,}$/.test(document.getElementById("passwordInput").value))
}
// validate re-password
function repasswordValidation() {
    return document.getElementById("repasswordInput").value == document.getElementById("passwordInput").value
}

// Initialize
$(async function() {
    await searchMeals("", "s");
    $(".loader").fadeOut(500);
    $("body").css("overflow", "auto");
    closeSideNav();
});