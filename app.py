from flask import Flask, render_template, jsonify
import requests
from bs4 import BeautifulSoup
import os

app = Flask(__name__)


# ==========================
# 🔥 1) دریافت قیمت طلا از estjt.ir
# ==========================
def get_gold_prices():
    url = "https://www.estjt.ir/"
    r = requests.get(url, timeout=10)
    soup = BeautifulSoup(r.text, "lxml")

    data = {}

    try:
        mozane = soup.select_one("tr:nth-of-type(2) td.price").text.strip()
        data["mozane"] = int(mozane.replace(",", ""))
    except:
        pass

    try:
        gold18 = soup.select_one("tr:nth-of-type(3) td.price").text.strip()
        data["gold18"] = int(gold18.replace(",", ""))
    except:
        pass

    try:
        gold24 = soup.select_one("tr:nth-of-type(4) td.price").text.strip()
        data["gold24"] = int(gold24.replace(",", ""))
    except:
        pass

    return data


# ==========================
# 🔥 2) دریافت ارز از tgju.org
# ==========================
def get_fx_prices():
    url = "https://www.tgju.org/currency"
    r = requests.get(url, timeout=10)
    soup = BeautifulSoup(r.text, "lxml")

    data = {}

    rows = soup.select("table.data-table tbody tr")

    for row in rows:
        tds = row.find_all("td")
        if len(tds) < 3:
            continue

        name = tds[0].text.strip()
        price = tds[1].text.strip().replace(",", "")

        if price.isdigit():
            price = int(price)

        if "دلار" in name:
            data["usd"] = price
        elif "یورو" in name:
            data["eur"] = price
        elif "پوند" in name:
            data["gbp"] = price
        elif "درهم" in name:
            data["aed"] = price
        elif "لیر" in name:
            data["try"] = price

    return data


# ==========================

@app.route("/api/prices")
def api_prices():
    gold = get_gold_prices()
    fx = get_fx_prices()

    return jsonify({"status": "ok", "data": {**gold, **fx}})


# ==========================


@app.route("/")
def home():
    return render_template("index.html")


# ==========================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
