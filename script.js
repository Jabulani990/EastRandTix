// Supabase setup
const supabaseUrl = 'https://oykcsembgwhvjhvynlxf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95a2NzZW1iZ3dodmpodnlubHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzAwODgsImV4cCI6MjA1NTcwNjA4OH0.CexPLdmMcMtBWyn2b6sW741Oh9s8-0UUh_ePpFO4h6I';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Fetch and display events
async function loadEvents() {
    const { data: events, error } = await supabase
        .from('events')
        .select('*');
    if (error) console.error(error);
    else {
        const eventList = document.getElementById('eventList');
        eventList.innerHTML = events.map(event => `
            <div class="event">
                <h3>${event.name}</h3>
                <p>Location: ${event.location}</p>
                <p>Date: ${event.date}</p>
                <p>Price: $${event.price}</p>
                <button onclick="buyTicket(${event.id})">Buy Ticket</button>
            </div>
        `).join('');
    }
}

// Handle event form submission
document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const event = {
        name: document.getElementById('eventName').value,
        location: document.getElementById('eventLocation').value,
        date: document.getElementById('eventDate').value,
        price: document.getElementById('eventPrice').value,
    };
    const { data, error } = await supabase
        .from('events')
        .insert([event]);
    if (error) console.error(error);
    else loadEvents();
});

// Load events on page load
loadEvents();