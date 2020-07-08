import xlrd
import pandas as pd
import requests
import os

# Getting today's file location
print("Getting today's file location")
r = requests.get("https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalGeral",
                 headers={"x-parse-application-id": "unAFkcaNDeXajurGB7LChj8SgQYS2ptm"})
# extracting today's file name and url
arquivo = str(r.json()["results"][0]["arquivo"]["url"])
name = str(r.json()["results"][0]["arquivo"]["name"])
print("Got today's file location")

# Getting today's file and saving it
print("Getting today's file and saving it")
r2 = requests.get(arquivo)
with open(name, 'wb') as fd:
    for chunk in r2.iter_content(chunk_size=128):
        fd.write(chunk)
print("Got today's file and saved it")

# Converting file to csv
print("Converting file to csv")
# csv_name = name.replace(".xlsx", ".csv")
csv_name = "HIST_PAINEL_COVIDBR.csv"
data_xls = pd.read_excel(name)
data_xls.to_csv(csv_name, encoding="utf-8", index=False)
print("Converted file to csv")

# Remove xlsx file
os.remove(name)
