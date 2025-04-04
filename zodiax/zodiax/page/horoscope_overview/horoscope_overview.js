function openDialog() {
    document.body.classList.add("no-scroll");
    document.getElementById("zodiacModal").style.display = "block";
}

function closeDialog() {
    document.querySelectorAll(".prediction-item").forEach(el => el.remove());
    document.body.classList.remove("no-scroll");
    document.getElementById("zodiacModal").style.display = "none";
}

function formatDate(date) {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };

    const _date = new Date(date);
    return _date.toLocaleDateString('en-US', options);
}

function formatZodiacDate(start, end) {
    const options = { month: 'long', day: 'numeric' };

    const startDate = new Date(start);
    const endDate = new Date(end);

    const formattedStart = startDate.toLocaleDateString('en-US', options);
    const formattedEnd = endDate.toLocaleDateString('en-US', options);

    return `${formattedStart} - ${formattedEnd}`;
}

async function showZodiacPopup(zodiacName) {
    const today = frappe.datetime.get_today(); // e.g., "2025-04-04"
    const docName = `${today}-${zodiacName}`;

    try {
        const data = await frappe.db.get_doc('Daily Horoscope', docName);
        updateZodiacDialog(data, zodiacName);
        openDialog()
    } catch (error) {
        frappe.msgprint(`No horoscope found for ${zodiacName} today.`);
        console.error("Failed to fetch Daily Horoscope:", error);
    }
}

function updateZodiacDialog(data, zodiacName) {
    const today = frappe.datetime.str_to_user(frappe.datetime.get_today());

    document.querySelector(".zodiac-header h2").textContent = zodiacName;
    document.querySelector(".zodiac-header .date").textContent = formatDate(today);
    document.querySelector(".zodiac-header img").src = data.zodiac_image;

    document.querySelector(".lucky-card:nth-child(1) div").textContent = data.lucky_number;
    document.querySelector(".lucky-card:nth-child(2) div").textContent = data.lucky_color;

    // Update Predictions
    const predictionContainer = document.querySelector(".predictions");
    (data.predictions || []).forEach(pred => {
        const item = document.createElement("div");
        item.className = "prediction-item";
        item.innerHTML = `
        <div class="category">${pred.category}</div>
        <div class="text">${pred.prediction_text}</div>
      `;
        predictionContainer.appendChild(item);
    });

    // Update Matches
    const matchesContainer = document.querySelector(".matches");
    matchesContainer.innerHTML = "";
    (data.matches || []).forEach(match => {
        const card = document.createElement("div");
        card.className = "match-card";
        card.innerHTML = `
        <img src="${match.zodiac_image}" />
        <div class="category">${match.category}</div>
      `;
        matchesContainer.appendChild(card);
    });

    // Update Stars
    const starsContainer = document.querySelector(".star-section");
    starsContainer.innerHTML = "";
    (data.ratings || []).forEach(item => {
        const rating = "★".repeat(item.star_rating) + "☆".repeat(5 - item.star_rating);
        const card = document.createElement("div");
        card.className = "star-card";
        card.innerHTML = `
        <div class="category">${item.category.replaceAll("_", " ")}</div>
        <div class="stars">${rating}</div>
      `;
        starsContainer.appendChild(card);
    });
}


frappe.pages['horoscope-overview'].on_page_load = function (wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: `Today's Horoscope`,
        single_column: true
    });

    // Create the filter section with a clean layout
    $(page.body).html(`
        <div class="zodiac-card-grid" id="zodiac-card-grid"></div>

        <div class="zodiac-modal" id="zodiacModal">
            <div class="zodiac-modal-content">
                <span class="zodiac-close-btn" onclick="document.getElementById('zodiac-modal').style.display='none'">&times;</span>
                <!-- Header -->
                <div class="zodiac-header">
                <img src="zodiac_image_url" alt="Zodiac">
                <div class="zodiac-info">
                    <h2>Leo</h2>
                    <div class="date">April 4, 2025</div>
                </div>
                </div>

                <!-- Lucky Cards -->
                <div class="lucky-cards">
                <div class="lucky-card">
                    <h4>Lucky Number</h4>
                    <div>7</div>
                </div>
                <div class="lucky-card">
                    <h4>Lucky Color</h4>
                    <div>Red</div>
                </div>
                </div>

                <!-- Daily Predictions -->
                <div class="predictions">
                    <h3>Today's Prediction</h3>
                </div>

                <!-- Match Cards -->
                <h3>Today's Matches</h3>
                <div class="matches">
                <div class="match-card">
                    <img src="aries_image_url" alt="Aries">
                    <div class="category">Love</div>
                </div>
                <div class="match-card">
                    <img src="gemini_image_url" alt="Gemini">
                    <div class="category">Friendship</div>
                </div>
                </div>

                <!-- Star Ratings -->
                <h3>Today's Vibe</h3>
                <div class="star-section">
                <div class="star-card">
                    <div class="category">Sex Drive</div>
                    <div class="stars">★★★★☆</div>
                </div>
                <div class="star-card">
                    <div class="category">Vibe</div>
                    <div class="stars">★★★☆☆</div>
                </div>
                </div>

            </div>
            </div>
    `);

    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Zodiac",
            fields: ["name", "start_date", "end_date", "description", "zodiac_image"],
            limit_page_length: 20
        },
        callback: function (r) {
            if (r.message) {
                let grid = wrapper.querySelector("#zodiac-card-grid");
                r.message.forEach(zodiac => {
                    let card = document.createElement("div");
                    card.className = "zodiac-card";
                    card.innerHTML = `
                <div class="zodiac-image"><img src="${zodiac.zodiac_image}" alt="${zodiac.name}"></div>
                <div class="zodiac-card-body">
                  <div class="zodiac-card-title">${zodiac.name}</div>
                  <div class="zodiac-card-date">${formatZodiacDate(zodiac.start_date, zodiac.end_date)}</div>
                  <div class="zodiac-card-description">${zodiac.description.slice(0, 100)}...</div>
                </div>
              `;
                    card.addEventListener("click", () => {
                        // document.getElementById("modal-title").textContent = zodiac.name;
                        // document.getElementById("modal-dates").textContent = `${zodiac.start_date} - ${zodiac.end_date}`;
                        // document.getElementById("modal-description").textContent = zodiac.description;
                        showZodiacPopup(zodiac.name)
                    });
                    grid.appendChild(card);
                });
            }
        }
    });

    // Close on outside click
    window.addEventListener("click", function (e) {
        const modal = document.getElementById("zodiacModal");
        if (e.target === modal) {
            closeDialog()
        }
    });
};
