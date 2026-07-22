/**
 * ==========================================
 * LIVE DEMO: SECURE CHAT SIMULATION
 * ==========================================
 */
const hackerNormalImg = "assets/Hacker_Calm.png";
const hackerAngryImg = "assets/Hacker_Rage.png";

async function sendDemoMsg() {
    const input = document.getElementById('tg-input-box'); const btn = document.getElementById('tg-send-btn'); const text = input.value.trim();
    if (!text) return;
    input.value = ''; input.disabled = true; btn.style.opacity = '0.5';

    appendDemoMsg('me', text, 'Sending...');
    let encText = customEncryptLogic(text); // Apply encryption visually to network packet
    await animateDemoPacket('me', encText);
    updateLastDemoMsgStatus('Sent ✓');

    await new Promise(r => setTimeout(r, 800)); // Artificial delay for bot thinking

    // Extremely extensive Regex-based Chatbot logic for Bob
    let lowerText = text.toLowerCase(); let reply = "";
    const badWords = ['fuck', 'shit', 'bitch', 'ass', 'crap', 'bastard', 'idiot', 'stupid', 'damn'];
    const isFoul = badWords.some(word => lowerText.includes(word));

    if (isFoul) {
        const foulReplies = ["Whoa, chill with the language man.", "Hey, keep it clean!", "No need for that kind of talk.", "Let's keep it respectful, alright?"];
        reply = foulReplies[Math.floor(Math.random() * foulReplies.length)];
    } else if (lowerText.match(/\b(bye|goodbye|see you|tata|cya|catch ya|later|see you soon)\b/)) {
        const byes = ["Catch you later, man!", "Bye! Stay safe.", "See ya! Let me know if you need anything.", "Tata! Don't forget the assignment.", "Later bro! Peace.", "Goodbye! Talk soon."];
        reply = byes[Math.floor(Math.random() * byes.length)];
    } else if (lowerText.match(/\b(nice to meet you|pleasure meeting you)\b/)) {
        const meets = ["Nice to meet you too, bro!", "Pleasure is all mine.", "Likewise! Always good to connect with a fellow dev."];
        reply = meets[Math.floor(Math.random() * meets.length)];
    } else if (lowerText.match(/\b(have a great day|have a good day|have a good one)\b/)) {
        const days = ["You too! Have a great day.", "Thanks man, you have a good one too!", "Appreciate it! Don't work too hard today."];
        reply = days[Math.floor(Math.random() * days.length)];
    } else if (lowerText.match(/\b(goodnight|gn|sweet dreams|going to sleep|bedtime)\b/)) {
        const nights = ["Goodnight bro! Don't let the bugs bite.", "Night man! I should probably sleep too.", "Sweet dreams! See you tomorrow.", "GN! Catch some Zs."];
        reply = nights[Math.floor(Math.random() * nights.length)];
    } else if (lowerText.match(/encryption tool|the app|our app|app project/)) {
        const appProj = ["Man, this Encryption Tool project is gonna be sick. My presentation is coming together. How's the actual programming going on your end?", "The Encryption Tool is gonna get us an A, I swear. I'm handling the slides, but please tell me the code is running smooth?", "Bro I'm hyped for our Encryption Tool. I got the pitch down. Have you finished the core backend logic yet?"];
        reply = appProj[Math.floor(Math.random() * appProj.length)];
    } else if (lowerText.match(/presentation|slides|powerpoint|pitch/)) {
        const pres = ["Bro, the slides for the Encryption Tool are almost done. Just tweaking the design. How's the backend code looking?", "I'm halfway through the presentation. Trying to make it look premium. Did you fix those bugs in the code?", "Presentation is basically ready. I just need you to send me some screenshots of the working app to put in the final slide. You done programming it?"];
        reply = pres[Math.floor(Math.random() * pres.length)];
    } else if (lowerText.match(/code|programming|backend|logic|bug|error|compile|gui/)) {
        const code = ["Let's gooo! If the code is working, we're golden. Does it actually encrypt without crashing now? 😂", "Send me a build later so I can test it. I need to make sure my presentation matches your GUI.", "Bro as long as the programming is done, we are safe. I can talk my way through the presentation. Is the GUI fully responsive?"];
        reply = code[Math.floor(Math.random() * code.length)];
    } else if (lowerText.match(/who are you|about yourself|your name|bio data/)) {
        const identity = ["I'm Bob, man. 21, trying to survive M.I.S.T., and figuring life out as I go. What else is there to know?", "Bro it's me, Bob. Did you hit your head or something? 😂", "Just a 21-year-old dude trying to get through polytechnic without losing my mind. You?"];
        reply = identity[Math.floor(Math.random() * identity.length)];
    } else if (lowerText.match(/are you gay|really gay|sexuality/)) {
        const straight = ["Nah bro, 100% straight. I just joke around with the homies haha.", "No man, definitely straight. The sus jokes are just for the culture 😂", "Straight as an arrow, bro. Don't let the homie banter fool you."];
        reply = straight[Math.floor(Math.random() * straight.length)];
    } else if (lowerText.match(/future plan|plan for future|what next|after college|future/)) {
        const future = ["Honestly? Graduate from M.I.S.T without losing my sanity, get a decent job in tech. What about you? Still aiming for that developer role?", "I just want to finish my diploma here, secure a bag, and chill. You?", "Bro I'm not even thinking that far ahead, just trying to survive this semester."];
        reply = future[Math.floor(Math.random() * future.length)];
    } else if (lowerText.match(/your gender|are you male|are you a guy|boy or girl/)) {
        const gender = ["I'm a guy, bro. Come on.", "100% male. You good man?", "Dude, I'm a guy. Why are you even asking? 😂"];
        reply = gender[Math.floor(Math.random() * gender.length)];
    } else if (lowerText.match(/your age|how old are you/)) {
        const ageQs = ["I'm 21, same as you man.", "21 bro. We're getting old. Ready to graduate?", "21 years young, though my back feels like I'm 40."];
        reply = ageQs[Math.floor(Math.random() * ageQs.length)];
    } else if (lowerText.match(/what college|your college|institute|university/)) {
        const college = ["M.I.S.T. bro. Same polytechnic institute that's currently draining our souls.", "We're both at M.I.S.T, remember? The polytechnic life.", "M.I.S.T. Why, you transferring? Take me with you if you do 😂"];
        reply = college[Math.floor(Math.random() * college.length)];
    } else if (lowerText.match(/mist|assignment|lab|exam|quiz|polytechnic|faculty|sir|class/)) {
        const mist = ["Bro don't even remind me about the M.I.S.T assignments, I'm just focusing on our Encryption Tool.", "Are we still grouped up for that lab assignment too?", "Man, the faculty here is giving us way too much pressure this semester.", "I swear if we get another surprise quiz from sir I'm dropping out.", "We really need to sit down and finish studying after we deliver this app."];
        reply = mist[Math.floor(Math.random() * mist.length)];
    } else if (lowerText.match(/age|21|adult|man|growing up/)) {
        const age = ["We're 21 now bro, we actually need to start acting like adults soon. Have you figured life out yet?", "Man to man, I have no idea what I'm doing with my life.", "Being a 21-year-old dude in college is basically just surviving on caffeine and stress.", "Honestly, I still feel like I'm 16 sometimes."];
        reply = age[Math.floor(Math.random() * age.length)];
    } else if (lowerText.match(/gay|sus|kiss|handsome|cute|homie|homies|pause/)) {
        const banter = ["Ayo? That's kinda sus bro 🤨", "Only for the homies man, you know the rules.", "Bro you're acting up again haha.", "Pause. Read what you just typed again. 😂", "It's not gay if it's the homies."];
        reply = banter[Math.floor(Math.random() * banter.length)];
    } else if (lowerText.match(/remember|memory|canteen|trip|tour|hostel|last year|first semester/)) {
        const memories = ["Dude, remember that time at the M.I.S.T canteen? I still can't believe that happened.", "We definitely need to plan another trip like last semester. Where should we go?", "Bro don't bring that up, I'm still embarrassed from that day 😂", "Good times man. We were so dumb back then.", "I still randomly think about our first semester and laugh."];
        reply = memories[Math.floor(Math.random() * memories.length)];
    } else if (lowerText.match(/\b(hello|hi|hey|yo|sup|greetings)\b/)) {
        const hellos = ["Hey man! How's the code coming along?", "Yo! What's good with the app?", "Hi there! Ready to crush this project?", "Hey! Long time no see.", "Sup? Doing alright?"];
        reply = hellos[Math.floor(Math.random() * hellos.length)];
    } else if (lowerText.match(/how are you|how u doing|whats up|hows it going|how are ya/)) {
        const howAreYous = ["I'm doing pretty good, just chilling and working on these slides. You?", "Not too bad, surviving the week! How about your end?", "Can't complain, tbh. Just had some coffee. You?", "Honestly? A bit tired but hanging in there. Working on the code?"];
        reply = howAreYous[Math.floor(Math.random() * howAreYous.length)];
    } else if (lowerText.match(/my day|today|day was|work|school/)) {
        const days = ["Work's been crazy today, just nonstop. Did you get much programming done?", "Pretty slow day on my end. What about yours?", "Just running errands mostly.", "Did absolutely nothing today and it was glorious.", "Ah man, I know that feeling. Some days just drag on forever."];
        reply = days[Math.floor(Math.random() * days.length)];
    } else if (lowerText.match(/hobby|hobbies|fun|freetime|free time|weekend|plans/)) {
        const plans = ["I usually just play games or binge YouTube. What are your plans for the weekend?", "Got zero plans for the weekend other than this Encryption Tool and I can't wait.", "Hoping to actually get out of the house this weekend haha. You?", "Mostly catching up on sleep lately lol."];
        reply = plans[Math.floor(Math.random() * plans.length)];
    } else if (lowerText.match(/food|eat|hungry|cooking|dinner|lunch|breakfast|pizza|biryani/)) {
        const foods = ["Man I'm starving, thinking about grabbing some biryani. You eaten yet?", "Just cooked some pasta, it actually turned out okay.", "I really need to stop ordering takeout so much.", "Honestly, I could eat a massive burger right now. You hungry?"];
        reply = foods[Math.floor(Math.random() * foods.length)];
    } else if (lowerText.match(/game|play|gaming|xbox|ps5|pc/)) {
        const games = ["Oh nice! I've been grinding some multiplayer games with friends. What are you playing?", "I need to clear my backlog, I buy too many games.", "PC or console? I've been playing a lot on PC lately."];
        reply = games[Math.floor(Math.random() * games.length)];
    } else if (lowerText.match(/music|song|listen|spotify/)) {
        const music = ["I've been listening to a lot of synthwave and indie rock lately. What about you?", "Man, I've just had the same playlist on repeat for weeks.", "Music is life! Got any good recommendations for while I make these slides?"];
        reply = music[Math.floor(Math.random() * music.length)];
    } else if (lowerText.match(/movie|watch|show|netflix|anime/)) {
        const movies = ["Just finished a really crazy thriller series. Seen anything good lately?", "I feel like I spend more time scrolling Netflix than watching anything.", "I'm a sucker for good sci-fi movies.", "Oh nice! I need a new show to binge, actually. Any recs?"];
        reply = movies[Math.floor(Math.random() * movies.length)];
    } else if (lowerText.match(/\b(good|great|fine|awesome|cool|nice)\b/)) {
        const positives = ["Glad to hear that! Keep at it.", "Always nice when things are going well.", "For sure, that's awesome. Means we are on track.", "Love to hear it!"];
        reply = positives[Math.floor(Math.random() * positives.length)];
    } else if (lowerText.match(/\b(yes|yeah|yep|sure|totally|exactly|agreed)\b/)) {
        const agreements = ["Yeah for sure. Let me know if you need anything from my end.", "100%.", "Totally agree with you.", "Yeah that makes perfect sense.", "Right? Exactly what I was thinking."];
        reply = agreements[Math.floor(Math.random() * agreements.length)];
    } else if (lowerText.match(/\b(no|nah|nope|never)\b/)) {
        const disagreements = ["Ah, gotcha.", "Fair enough.", "Makes sense.", "Yeah I guess that's true.", "Bummer, but I get it. Let's pivot if we need to."];
        reply = disagreements[Math.floor(Math.random() * disagreements.length)];
    } else if (lowerText.includes("joke")) {
        const jokes = ["I'm terrible at jokes... Why did the programmer quit his job? Because he didn't get arrays. ...I'll leave.", "What do you call fake spaghetti? An impasta!", "I would tell you a joke about pizza, but it's a little cheesy. Let's just focus on the app 😂"];
        reply = jokes[Math.floor(Math.random() * jokes.length)];
    } else if (lowerText.match(/weather|rain|sunny|hot|cold|cloudy/)) {
        const weathers = ["The weather has been super weird lately right?", "It's either boiling hot or raining endlessly. No in-between.", "Man, I'm just staying inside today. Not dealing with that weather."];
        reply = weathers[Math.floor(Math.random() * weathers.length)];
    } else if (lowerText.match(/sports|football|soccer|cricket|basketball/)) {
        const sports = ["Did you catch the game last night?", "I used to play a lot, but now I mostly just watch the highlights.", "Sports are great, but I'm basically glued to my computer screen these days."];
        reply = sports[Math.floor(Math.random() * sports.length)];
    } else if (lowerText.match(/car|bike|drive|ride|traffic/)) {
        const transit = ["Traffic in this city is actually a nightmare.", "I really need to get my own ride sorted out soon.", "Sometimes I just want to go for a long drive and forget about college."];
        reply = transit[Math.floor(Math.random() * transit.length)];
    } else {
        const generic = ["Oh, really? Tell me more about that.", "Haha, yeah I completely know what you mean.", "That's pretty wild.", "Hmm, interesting.", "I was literally just thinking about that.", "Gotcha. Anyway, what else is new with the app?", "Right on.", "Crazy how that works.", "For sure. So what's the plan for the rest of the day?", "Haha, honestly yeah.", "Wait, seriously?", "That's actually super cool. Send over a screenshot later."];
        reply = generic[Math.floor(Math.random() * generic.length)];
    }

    let encReply = customEncryptLogic(reply); // Encrypt bot's reply for visual packet
    await animateDemoPacket('friend', encReply);
    appendDemoMsg('friend', reply, '');
    input.disabled = false; btn.style.opacity = '1'; input.focus();
}

// Appends DOM elements for chat bubbles
function appendDemoMsg(sender, text, status) {
    const msgs = document.getElementById('tg-messages'); const div = document.createElement('div'); div.className = `tg-msg ${sender}`;
    div.innerHTML = `<span>${text}</span> ${status ? `<div class="msg-status">${status}</div>` : ''}`;
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
}

function updateLastDemoMsgStatus(statusText) { const msgs = document.querySelectorAll('.tg-msg.me .msg-status'); if (msgs.length > 0) { msgs[msgs.length - 1].innerText = statusText; } }

// Drives the visual animation of a packet moving across the network map, being intercepted by hacker
function animateDemoPacket(direction, encryptedPayload) {
    return new Promise(resolve => {
        const packet = document.getElementById('net-packet'); const hackerProfile = document.getElementById('hacker-profile');
        const hackerLog = document.getElementById('hacker-terminal'); const hackerAvatarImg = document.getElementById('hacker-avatar-img');

        packet.style.opacity = '1'; packet.style.transition = 'none';
        if (direction === 'me') { packet.style.left = '0%'; packet.style.background = '#00E5FF'; packet.style.boxShadow = '0 0 12px #00E5FF'; }
        else { packet.style.left = '100%'; packet.style.background = '#00FF66'; packet.style.boxShadow = '0 0 12px #00FF66'; }
        void packet.offsetWidth;

        packet.style.transition = 'left 0.8s ease-in-out'; packet.style.left = '50%'; // Move to middle (intercept point)

        setTimeout(() => {
            // Packet is at 50% (intercepted)
            hackerProfile.classList.add('angry'); if (hackerAvatarImg) hackerAvatarImg.src = hackerAngryImg;

            // Update Hacker log
            const logEntry = document.createElement('div'); logEntry.className = 'term-line intercept';
            logEntry.innerHTML = `<span style="color:var(--text-main);">> Sniffing packet...</span><br>> [ENCRYPTED]: ${encryptedPayload} <br><span style="color:var(--danger);">> ERROR: KEY REQUIRED. READ FAILED.</span>`;
            hackerLog.appendChild(logEntry); hackerLog.scrollTop = hackerLog.scrollHeight;

            // Trigger random hacker floating texts
            const frustrations = [
                "What are they talking about?!",
                "Why can't I read this message?!",
                "Curse this encryption!",
                "More gibberish?!",
                "I need the key!",
                "Decryptor failing...",
                "What is this AES garbage?!",
                "Stop encrypting everything!"
            ];

            for (let i = 0; i < 2; i++) {
                let fl = document.createElement('div');
                fl.className = 'floating-frustration';
                fl.innerText = frustrations[Math.floor(Math.random() * frustrations.length)];
                fl.style.left = (Math.random() * 40 + 10) + '%';
                fl.style.top = (Math.random() * 40 + 30) + '%';
                if (i === 1) fl.style.animationDelay = "0.3s";
                hackerProfile.appendChild(fl);
                setTimeout(() => fl.remove(), 3000);
            }

            // Complete packet journey
            packet.style.left = direction === 'me' ? '100%' : '0%';
            setTimeout(() => {
                packet.style.opacity = '0';
                setTimeout(() => { hackerProfile.classList.remove('angry'); if (hackerAvatarImg) hackerAvatarImg.src = hackerNormalImg; }, 300);
                resolve(); // Resolve promise to let chat continue
            }, 800);
        }, 800);
    });
}