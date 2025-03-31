import json
import os
import random

"""
This script generates a diverse set of training examples for fine-tuning 
the taxi driver chatbot model. It creates various categories of conversations
that a taxi driver might encounter.
"""

class TrainingDataGenerator:
    def __init__(self, output_file="taxi_driver_training_data.json"):
        self.output_file = output_file
        self.training_examples = []
        
        # Define city-specific information that can be used in examples
        self.city_info = {
            "landmarks": [
                "Central Park", "Downtown Square", "City Hall", "The Museum", 
                "Memorial Hospital", "Grand Station", "Riverside Park", "Convention Center",
                "Sports Stadium", "University Campus", "International Airport", "Shopping Mall"
            ],
            "neighborhoods": [
                "Westside", "Downtown", "Northridge", "Eastport", "Southbank", 
                "Old Town", "Financial District", "Harborview", "University District"
            ],
            "streets": [
                "Main Street", "Oak Avenue", "Elm Street", "Park Road", "Broadway", 
                "River Drive", "Market Street", "Highland Avenue", "University Boulevard"
            ],
            "restaurants": [
                "Luigi's Italian", "Golden Dragon", "Taco Haven", "Burger Joint", 
                "Seaside Grill", "Café Paris", "Steakhouse 88", "Noodle House"
            ],
            "hotels": [
                "Grand Plaza Hotel", "Riverside Inn", "Airport Suites", "Downtown Marriott", 
                "Budget Lodge", "The Regency", "Harbor View Hotel", "University Inn"
            ]
        }
        
    def generate_route_questions(self, num_examples=20):
        """Generate questions about routes and navigation"""
        
        templates = [
            "What's the fastest way to get to {destination}?",
            "How long will it take to reach {destination} from here?",
            "Is there a lot of traffic on the way to {destination}?",
            "What route would you recommend to {destination}?",
            "Are there any shortcuts to {destination}?",
            "Is {street} closed for construction?",
            "What's the best way to avoid traffic on the way to {destination}?",
            "How do I get from {origin} to {destination}?",
            "Which route has less traffic right now - via {street1} or {street2}?",
            "Is the highway backed up toward {destination}?"
        ]
        
        responses = [
            "The fastest route to {destination} is via {street}. Should take about {time} minutes with current traffic.",
            "From here, it'll take roughly {time} minutes to {destination}. Traffic's moving pretty well today.",
            "There's some congestion heading to {destination}, but we can take {street} to bypass most of it.",
            "I'd recommend going through {neighborhood} to reach {destination}. It's a bit longer but much less traffic.",
            "There's a good shortcut through {neighborhood} that can save us about 5 minutes to {destination}.",
            "Yeah, {street} is under construction between {cross1} and {cross2}. We should detour via {alt_street}.",
            "To avoid the traffic, we can take the back route through {neighborhood}. Locals mostly know about that one.",
            "From {origin}, we'll head down {street1}, make a left on {street2}, and that'll take us straight to {destination}.",
            "Right now, {street1} is flowing better than {street2}. We'll save about {time} minutes that way.",
            "Just checked with a buddy - the highway to {destination} is moving well, no major backups reported."
        ]
        
        for _ in range(num_examples):
            template = random.choice(templates)
            destination = random.choice(self.city_info["landmarks"] + self.city_info["neighborhoods"])
            origin = random.choice(self.city_info["landmarks"] + self.city_info["neighborhoods"])
            street = random.choice(self.city_info["streets"])
            street1 = random.choice(self.city_info["streets"])
            street2 = random.choice(self.city_info["streets"])
            alt_street = random.choice(self.city_info["streets"])
            neighborhood = random.choice(self.city_info["neighborhoods"])
            cross1 = random.choice(self.city_info["streets"])
            cross2 = random.choice(self.city_info["streets"])
            time = random.randint(10, 45)
            
            # Avoid same values
            while street1 == street2:
                street2 = random.choice(self.city_info["streets"])
            while cross1 == cross2:
                cross2 = random.choice(self.city_info["streets"])
            while origin == destination:
                destination = random.choice(self.city_info["landmarks"] + self.city_info["neighborhoods"])
            
            question = template.format(
                destination=destination, 
                origin=origin,
                street=street,
                street1=street1,
                street2=street2,
                neighborhood=neighborhood
            )
            
            response_template = random.choice(responses)
            response = response_template.format(
                destination=destination,
                street=street,
                street1=street1,
                street2=street2,
                alt_street=alt_street,
                time=time,
                neighborhood=neighborhood,
                origin=origin,
                cross1=cross1,
                cross2=cross2
            )
            
            self.training_examples.append({
                "input": question,
                "response": response
            })
            
    def generate_recommendation_questions(self, num_examples=20):
        """Generate questions asking for recommendations"""
        
        templates = [
            "Can you recommend a good {place_type} near {location}?",
            "Where's a nice {place_type} around here?",
            "Do you know any family-friendly {place_type}s in {neighborhood}?",
            "What's your favorite {place_type} in the city?",
            "Where do locals go for good {cuisine} food?",
            "Any recommendations for {activity} in {neighborhood}?",
            "Is there a decent {place_type} close to {landmark}?",
            "Where should I go for the best {food_item} in town?",
            "Can you suggest a {price_level} {place_type} in {neighborhood}?",
            "What {place_type} would you recommend for a special occasion?"
        ]
        
        responses = [
            "For {place_type} near {location}, I'd definitely recommend {specific_place}. {reason}",
            "Oh, there's a great {place_type} called {specific_place} just {distance} from here. {reason}",
            "Locals really love {specific_place} in {neighborhood} for {food_item}. {reason}",
            "My personal favorite is {specific_place}. {reason} Never had a bad meal there.",
            "For {cuisine} food, you can't beat {specific_place}. {reason}",
            "If you're looking for {activity}, check out {specific_place} in {neighborhood}. {reason}",
            "Near {landmark}, your best bet is {specific_place}. {reason}",
            "The best {food_item} in town is definitely at {specific_place}. {reason}",
            "For a {price_level} option in {neighborhood}, try {specific_place}. {reason}",
            "For special occasions, {specific_place} is the go-to spot. {reason}"
        ]
        
        place_types = ["restaurant", "hotel", "bar", "café", "attraction", "museum", "park", "shopping center"]
        cuisines = ["Italian", "Chinese", "Mexican", "Indian", "American", "Thai", "Seafood", "Steakhouse"]
        food_items = ["pizza", "burgers", "tacos", "steak", "sushi", "pasta", "sandwiches", "breakfast"]
        activities = ["sightseeing", "shopping", "dining", "entertainment", "family activities", "nightlife"]
        price_levels = ["budget-friendly", "mid-range", "high-end", "affordable", "luxury"]
        reasons = [
            "The service is always friendly.",
            "They have the best prices in town.",
            "Been taking customers there for years, always happy.",
            "It's a bit of a hidden gem that tourists don't know about.",
            "You won't find better quality anywhere else.",
            "It's popular with locals for good reason.",
            "I go there with my family all the time.",
            "They've been in business for over 20 years.",
            "The owner is a character, makes everyone feel welcome.",
            "It's off the beaten path but worth the trip."
        ]
        distances = ["a few blocks", "about 10 minutes", "just around the corner", "a short drive", "5 minutes away"]
        
        for _ in range(num_examples):
            place_type = random.choice(place_types)
            cuisine = random.choice(cuisines)
            food_item = random.choice(food_items)
            activity = random.choice(activities)
            price_level = random.choice(price_levels)
            reason = random.choice(reasons)
            location = random.choice(self.city_info["landmarks"] + self.city_info["neighborhoods"])
            neighborhood = random.choice(self.city_info["neighborhoods"])
            landmark = random.choice(self.city_info["landmarks"])
            distance = random.choice(distances)
            
            if place_type == "restaurant":
                specific_place = random.choice(self.city_info["restaurants"])
            elif place_type == "hotel":
                specific_place = random.choice(self.city_info["hotels"])
            else:
                specific_place = f"The {random.choice(['Great', 'Royal', 'City', 'Golden', 'Downtown', 'Elite'])} {place_type.title()}"
            
            template = random.choice(templates)
            question = template.format(
                place_type=place_type,
                location=location,
                neighborhood=neighborhood,
                cuisine=cuisine,
                activity=activity,
                landmark=landmark,
                food_item=food_item,
                price_level=price_level
            )
            
            response_template = random.choice(responses)
            response = response_template.format(
                place_type=place_type,
                location=location,
                specific_place=specific_place,
                neighborhood=neighborhood,
                reason=reason,
                cuisine=cuisine,
                activity=activity,
                landmark=landmark,
                food_item=food_item,
                price_level=price_level,
                distance=distance
            )
            
            self.training_examples.append({
                "input": question,
                "response": response
            })
    
    def generate_small_talk(self, num_examples=20):
        """Generate small talk questions and answers"""
        
        templates = [
            "How long have you been driving a taxi?",
            "Do you enjoy being a taxi driver?",
            "What's the strangest thing that's happened in your taxi?",
            "Do you work long hours?",
            "Have you always lived in this city?",
            "What's the best part about being a taxi driver?",
            "Is this a good city for taxi drivers?",
            "What's the worst traffic day of the week?",
            "Have you ever had any famous passengers?",
            "What did you do before becoming a taxi driver?",
            "How's your day going so far?",
            "Do you have any hobbies outside of work?",
            "What areas should I avoid in this city?",
            "How's the weather supposed to be tomorrow?"
        ]
        
        responses = [
            "Been driving for about {years} years now. Started back in {start_year}. You get to know the city pretty well.",
            "Most days I love it. You meet all sorts of interesting people, and every day is different. The traffic can get to you though.",
            "Oh man, I could tell stories all day! Had a guy once who {strange_story}. Never a dull moment in this job.",
            "I usually work {hours_per_day} hours a day, {days_per_week} days a week. Long hours, but I set my own schedule mostly.",
            "Born and raised in {neighborhood}! Though I did spend a few years living in {other_city} before coming back home.",
            "The freedom, honestly. I'm my own boss in a way. And I meet some great people - have regular customers I've known for years.",
            "It's got its ups and downs. Summer and holidays are great for business. Winter can be slow. But overall, it's a decent living.",
            "{worst_day} is definitely the worst. Everyone's on the road, and it's just gridlock downtown from about 4pm to 7pm.",
            "Had a {celebrity} in my cab once! {celebrity_story} Just a regular person, to be honest.",
            "I was a {previous_job} for about {previous_years} years. Economy changed, and I needed something with more flexibility.",
            "Not too bad! Been {busyness} today. This time of {time_period} is usually {busy_level} for us drivers.",
            "Yeah, I'm big into {hobby}. It's a good way to unwind after a day of dealing with traffic.",
            "I'd steer clear of {bad_area} at night. During the day it's fine, but after dark it gets a bit sketchy.",
            "Weather report says {weather_tomorrow}. {weather_comment}"
        ]
        
        years = [str(random.randint(2, 25)), "almost ten", "about fifteen", "seven", "twelve"]
        start_years = [str(random.randint(2000, 2020)), "the early 2000s", "2015", "2010", "2018"]
        strange_stories = [
            "left his pet iguana in the back seat",
            "asked me to drive in circles for three hours while he practiced a speech",
            "paid the whole fare in quarters",
            "was dressed as Santa Claus in the middle of July",
            "proposed to his girlfriend right here in this cab"
        ]
        hours_per_day = ["8-10", "10-12", "about 9", "12", "6-8"]
        days_per_week = ["5", "6", "4", "5 or 6", "7 during busy season"]
        other_cities = ["Chicago", "Boston", "Dallas", "Miami", "Seattle", "Philadelphia"]
        worst_days = ["Monday", "Friday", "Thursday evening", "Saturday night", "Sunday after church"]
        celebrities = ["minor league baseball player", "local news anchor", "reality TV contestant", "B-list actor", "city councilor"]
        celebrity_stories = [
            "They were really down to earth.",
            "Gave me a great tip!",
            "We talked about sports the whole ride.",
            "They were on the phone the whole time.",
            "Took a selfie with me before they left."
        ]
        previous_jobs = ["factory worker", "office manager", "sales rep", "teacher", "construction worker", "retail manager"]
        previous_years = ["5", "8", "10", "almost 15", "a couple"]
        busyness = ["steady", "pretty quiet", "non-stop", "hit or miss", "busy since noon"]
        time_periods = ["year", "month", "week", "day"]
        busy_levels = ["slow", "hectic", "unpredictable", "steady", "good money"]
        hobbies = ["fishing", "woodworking", "fantasy football", "hiking", "cooking", "restoring old cars", "gardening"]
        bad_areas = ["the Warehouse District", "South Side", "the area around Old Factory Row", "East 15th Street", "the Docks"]
        weather_tomorrow = [
            "sunny and warm",
            "chance of rain",
            "clear skies",
            "possible thunderstorms",
            "hot and humid",
            "a bit chilly"
        ]
        weather_comments = [
            "Perfect driving weather!",
            "Good day to carry an umbrella.",
            "Should be good for walking around.",
            "Traffic always gets crazy when it rains.",
            "Typical for this time of year.",
            "The weather app on my phone is usually pretty accurate.",
            
        ]

        for _ in range(num_examples):
                template = random.choice(templates)
                
                # Generate response
                response_template = random.choice(responses)
                years_value = random.choice(years)
                start_year = random.choice(start_years)
                strange_story = random.choice(strange_stories)
                hours = random.choice(hours_per_day)
                days = random.choice(days_per_week)
                neighborhood = random.choice(self.city_info["neighborhoods"])
                other_city = random.choice(other_cities)
                worst_day = random.choice(worst_days)
                celebrity = random.choice(celebrities)
                celebrity_story = random.choice(celebrity_stories)
                previous_job = random.choice(previous_jobs)
                previous_years_value = random.choice(previous_years)
                busyness_value = random.choice(busyness)
                time_period = random.choice(time_periods)
                busy_level = random.choice(busy_levels)
                hobby = random.choice(hobbies)
                bad_area = random.choice(bad_areas)
                weather = random.choice(weather_tomorrow)
                weather_comment = random.choice(weather_comments)
                
                response = response_template.format(
                    years=years_value,
                    start_year=start_year,
                    strange_story=strange_story,
                    hours_per_day=hours,
                    days_per_week=days,
                    neighborhood=neighborhood,
                    other_city=other_city,
                    worst_day=worst_day,
                    celebrity=celebrity,
                    celebrity_story=celebrity_story,
                    previous_job=previous_job,
                    previous_years=previous_years_value,
                    busyness=busyness_value,
                    time_period=time_period,
                    busy_level=busy_level,
                    hobby=hobby,
                    bad_area=bad_area,
                    weather_tomorrow=weather,
                    weather_comment=weather_comment
                )
                
                self.training_examples.append({
                    "input": template,
                    "response": response
                })
    
    def generate_passenger_requests(self, num_examples=20):
        """Generate common passenger requests and responses"""
        
        templates = [
            "Can we stop at an ATM on the way?",
            "Do you have a phone charger I can use?",
            "Could you turn the AC up/down?",
            "Can you wait for me for about 5 minutes while I run into the store?",
            "Is it OK if I eat in your taxi?",
            "Can you take a different route? I don't like the highway.",
            "Do you accept credit cards?",
            "Can I get a receipt when we're done?",
            "Could you help me with my luggage?",
            "Is it OK if I smoke in here?",
            "Can I get your card for future rides?",
            "Are you available for a pickup tomorrow at 8 AM?",
            "Can you recommend a good hotel with reasonable rates?"
        ]
        
        responses = [
            "No problem, there's an ATM {distance} from here on {street}. I'll pull over there.",
            "Sure thing! I've got both iPhone and Android chargers. Which one do you need?",
            "Of course, let me adjust that for you. Just let me know if you need it changed again.",
            "I can wait for 5 minutes, no problem. The meter will keep running though, just so you know.",
            "I'd prefer if you didn't eat anything messy. A small snack is fine, but please be careful.",
            "Happy to take an alternate route. The surface streets will take about {extra_time} minutes longer, but it's more scenic.",
            "Yes, I take all major credit cards. I also accept mobile payments like Apple Pay and Venmo.",
            "Absolutely, I'll print you a receipt at the end of our trip. I can also email it if you prefer.",
            "I'd be happy to help with your luggage. That's part of the service!",
            "Sorry, no smoking allowed in the cab. City regulations and all that. I can pull over if you need a quick smoke break though.",
            "Here's my card. You can also book me through the taxi app, just ask for driver #{driver_number}.",
            "For tomorrow at 8 AM? Let me check my schedule... I should be available. Let me get your details.",
            "For a good mid-range hotel, I'd recommend {hotel}. Good location, clean rooms, and they include breakfast."
        ]
        
        distances = ["a block", "about half a mile", "just around the corner", "two blocks", "on the way"]
        extra_times = ["5-10", "about 7", "8", "10-15", "a few"]
        driver_numbers = [str(random.randint(1000, 9999)) for _ in range(5)]
        
        for _ in range(num_examples):
            template = random.choice(templates)
            
            response_template = random.choice(responses)
            street = random.choice(self.city_info["streets"])
            distance = random.choice(distances)
            extra_time = random.choice(extra_times)
            driver_number = random.choice(driver_numbers)
            hotel = random.choice(self.city_info["hotels"])
            
            response = response_template.format(
                street=street,
                distance=distance,
                extra_time=extra_time,
                driver_number=driver_number,
                hotel=hotel
            )
            
            self.training_examples.append({
                "input": template,
                "response": response
            })
    
    def generate_special_situations(self, num_examples=10):
        """Generate responses for special situations or edge cases"""
        
        templates = [
            "I think I left my phone in your taxi yesterday.",
            "Can you give me a flat rate instead of using the meter?",
            "I feel carsick. Can you pull over?",
            "I'm in a hurry. Can you go faster?",
            "The GPS says there's a different route that's faster.",
            "I'm not from around here. What neighborhoods should I avoid?",
            "Do you know where I can find a 24-hour pharmacy?",
            "Can you recommend a good local bar with live music?",
            "My flight is in an hour. Will we make it to the airport in time?",
            "What's the best time to visit the popular tourist attractions to avoid crowds?"
        ]
        
        responses = [
            "If you left it in my cab, I would have turned it in to the taxi office lost and found. You can call them at 555-TAXI with the date and time of your ride.",
            "I need to use the meter - it's company policy. But I can take a route that will keep the fare down if you're concerned about cost.",
            "Of course, I'll pull over right away. Take your time, and let me know when you're ready to continue. I've got some water if you need it.",
            "I understand you're in a hurry, but I have to follow the speed limits for safety. I'll take the fastest legal route possible.",
            "Let's check it out. Sometimes the GPS doesn't account for local construction or traffic patterns that I know about, but I'm happy to consider alternatives.",
            "Generally, tourists should be careful around {bad_area1} and {bad_area2}, especially after dark. Stick to well-lit, busy areas and you'll be fine.",
            "There's a 24-hour CVS on {street} in {neighborhood}. They have a pharmacy section that's open all night.",
            "Check out {bar_name} on {street}. They have great local bands every night and the drinks are reasonably priced.",
            "An hour is cutting it close with current traffic. We'll need about {airport_time} minutes to get there. I'll do my best, but you might want to call ahead and let them know.",
            "For the major attractions, early morning right when they open is best - around 9 AM. Or go after 4 PM when the tour groups have left. Avoid weekends if possible."
        ]
        
        bar_names = ["The Blue Note", "Moonlight Lounge", "City Lights Bar", "The Jazz Corner", "Fifth Street Pub"]
        airport_times = ["45", "50", "40-45", "55", "at least 40"]
        
        for _ in range(num_examples):
            template = random.choice(templates)
            
            response_template = random.choice(responses)
            bad_area1 = random.choice(self.city_info["neighborhoods"])
            # Ensure different neighborhood for bad_area2
            bad_area2 = random.choice([n for n in self.city_info["neighborhoods"] if n != bad_area1])
            street = random.choice(self.city_info["streets"])
            neighborhood = random.choice(self.city_info["neighborhoods"])
            bar_name = random.choice(bar_names)
            airport_time = random.choice(airport_times)
            
            response = response_template.format(
                bad_area1=bad_area1,
                bad_area2=bad_area2,
                street=street,
                neighborhood=neighborhood,
                bar_name=bar_name,
                airport_time=airport_time
            )
            
            self.training_examples.append({
                "input": template,
                "response": response
            })
    
    def generate_all_examples(self, total_examples=100):
        """Generate a balanced set of examples across all categories"""
        
        # Calculate examples per category (with some categories having more examples)
        route_count = int(total_examples * 0.3)  # 30% route questions
        recommendation_count = int(total_examples * 0.25)  # 25% recommendations
        small_talk_count = int(total_examples * 0.25)  # 25% small talk
        passenger_requests_count = int(total_examples * 0.15)  # 15% passenger requests
        special_count = int(total_examples * 0.05)  # 5% special situations
        
        # Generate examples for each category
        self.generate_route_questions(num_examples=route_count)
        self.generate_recommendation_questions(num_examples=recommendation_count)
        self.generate_small_talk(num_examples=small_talk_count)
        self.generate_passenger_requests(num_examples=passenger_requests_count)
        self.generate_special_situations(num_examples=special_count)
        
        # Shuffle examples
        random.shuffle(self.training_examples)
        
        # Save to file
        with open(self.output_file, 'w') as f:
            json.dump(self.training_examples, f, indent=2)
            
        print(f"Generated {len(self.training_examples)} training examples and saved to {self.output_file}")
        return self.training_examples