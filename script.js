// Supabase setup
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-anon-key';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Stripe setup
const stripe = Stripe('your-stripe-publishable-key');

// Fetch and display events
async function loadEvents(category = "all") {
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .ilike('category', category === "all" ? '%' : category);

    if (error) console.error(error);
    else {
        const eventList = document.getElementById('eventList');
        eventList.innerHTML = events.map(event => `
            <div class="col-md-4 mb-4">
                <div class="event-card">
                    <img src="${event.image_url}" alt="${event.name}">
                    <div class="card-body">
                        <h3>${event.name}</h3>
                        <p>Location: ${event.location}</p>
                        <p>Date: ${event.date}</p>
                        <p>Price: $${event.price}</p>
                        <button class="btn btn-primary" data-event-id="${event.id}">Buy Ticket</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to "Buy Ticket" buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', async () => {
                const eventId = button.getAttribute('data-event-id');
                const { data: event, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', eventId)
                    .single();

                if (error) console.error(error);
                else {
                    // Redirect to Stripe Checkout
                    const response = await fetch('/create-checkout-session', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            eventId: event.id,
                            eventName: event.name,
                            eventPrice: event.price * 100, // Convert to cents
                        }),
                    });

                    const session = await response.json();
                    const result = await stripe.redirectToCheckout({ sessionId: session.id });
                    if (result.error) alert(result.error.message);
                }
            });
        });
    }
}

// Handle filter button clicks
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const category = button.getAttribute('data-category');
        loadEvents(category);
    });
});

// Handle search form submission
document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('searchQuery').value.toLowerCase();
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .ilike('name', `%${query}%`);

    if (error) console.error(error);
    else {
        const eventList = document.getElementById('eventList');
        eventList.innerHTML = events.map(event => `
            <div class="col-md-4 mb-4">
                <div class="event-card">
                    <img src="${event.image_url}" alt="${event.name}">
                    <div class="card-body">
                        <h3>${event.name}</h3>
                        <p>Location: ${event.location}</p>
                        <p>Date: ${event.date}</p>
                        <p>Price: $${event.price}</p>
                        <button class="btn btn-primary" data-event-id="${event.id}">Buy Ticket</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
});

// Load events on page load
loadEvents();
