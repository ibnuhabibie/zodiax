frappe.pages['horoscope-overview'].on_page_load = function (wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Horoscope Overview',
        single_column: true
    });

    // Create the filter section with a clean layout
	$(page.body).html(`
        <div class="horoscope-container">
            <div class="filter-section">
                <div class="filter-item">
                    <label>Zodiac Sign</label>
                    <select id="zodiac-select" class="form-control">
                        ${["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", 
                           "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
                            .map(zodiac => `<option value="${zodiac.toLowerCase()}">${zodiac}</option>`)
                            .join("")}
                    </select>
                </div>

                <div class="filter-item">
                    <label>Date</label>
                    <input type="date" id="date-select" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                </div>

                <div class="filter-button">
                    <button class="btn btn-primary" id="get-horoscope">Get Horoscope</button>
                </div>
            </div>

            <div id="horoscope-content"></div>
        </div>
    `);

    // Fetch horoscope data on button click
    $('#get-horoscope').click(function () {
        let zodiac = $('#zodiac-select').val();
        let selectedDate = $('#date-select').val();

        if (!zodiac || !selectedDate) {
            frappe.msgprint("Please select a zodiac sign and date.");
            return;
        }

        let doc_name = `${selectedDate}-${zodiac}`;

        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Daily Horoscope",
                name: doc_name
            },
            callback: function (r) {
                let content = $('#horoscope-content');
                content.empty();

                if (r.message) {
                    let data = r.message;

                    let predictions_html = data.predictions?.map(pred => 
                        `<p><strong>${formatCategory(pred.category)}:</strong> ${pred.prediction_text}</p>`
                    ).join("") || "<p>No predictions available.</p>";

                    let matches_html = data.matches?.map(match => 
                        `<div class="match-item"><strong>${formatCategory(match.category)}:</strong> ${match.zodiac}</div>`
                    ).join("") || "<p>No matches available.</p>";

                    let ratings_html = data.ratings?.map(rating => 
                        `<div class="rating-item"><strong>${formatCategory(rating.category)}:</strong> ⭐ ${rating.star_rating}/5</div>`
                    ).join("") || "<p>No ratings available.</p>";

                    content.html(`
                        <div class="horoscope-title">${data.zodiac_sign}</div>
						<div class="horoscope-lucky">
							<span>Lucky Color: ${data.lucky_color}</span>
							<span>Lucky Number: ${data.lucky_number}</span>
						</div>
						<div class="horoscope-section">
            				<h3>Predictions</h3>
							<div class="horoscope-predictions">${predictions_html}</div>
						</div>
						<div class="horoscope-section">
							<h3>Best Matches</h3>
							<div class="horoscope-matches">${matches_html}</div>
						</div>
						 <div class="horoscope-section">
							<h3>Star Ratings</h3>
							<div class="horoscope-ratings">${ratings_html}</div>
						</div>
                    `);

					content.addClass("content-exist")
                } else {
                    content.html(`<p class="text-danger">Horoscope not available for this date.</p>`);
                }
            }
        });
    });
};

// Helper function to format category names
function formatCategory(category) {
    return category.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
}
