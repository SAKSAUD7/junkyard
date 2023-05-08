import requests

api_key = "6e9831d11cd0304a6d906151aa734434"
city = "New York"

url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}"

response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    temperature = data["main"]["temp"]
    print(f"The current temperature in {city} is {temperature} Kelvin.")
else:
    print("Error retrieving weather data.")
    
pip install requests
