import requests
import zipfile
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

# Extracting csv file
print("Extracting csv file")
csv_name = "HIST_PAINEL_COVIDBR.csv"
with zipfile.ZipFile(name, 'r') as downloaded, open(csv_name, 'wb') as target:
  to_extract = downloaded.namelist()[0]
  print(f"Extracting {to_extract} to {csv_name}")
  target.write(downloaded.read(to_extract))
print("Extracted csv file")

# Remove zip file
os.remove(name)
