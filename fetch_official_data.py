import requests
import zipfile
import os


class FetchCovidError(Exception):
  """Basic error for this module."""
  pass


class FileTypeNotSupportedError(FetchCovidError):
  """Error raised when given file type by the API cannot be converted to csv by
  this module.


  """

  def __init__(self, file_name, file_type):
    self.file_name = file_name
    self.file_type = file_type

  def ___str___(self):
    return f"File {self.file_name} with type {self.file_type} cannot be converted to csv."
  pass


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

file_type = name.rsplit('.', 1)[1]
print(f"Today's file name is {name}")
print(f"Today's file type is {file_type}")

# Saving to correct csv
csv_name = "HIST_PAINEL_COVIDBR.csv"

if file_type == "csv":
  print("Renaming csv file")
  os.remove(csv_name)
  os.rename(name, csv_name)
  print("Csv file renamed")
elif file_type == "zip":
  print("Extracting csv file")
  # Open zip file and destination file
  with zipfile.ZipFile(name, 'r') as downloaded, open(csv_name, 'wb') as target:
    to_extract = downloaded.namelist()[0]
    print(f"Extracting {to_extract} to {csv_name}")
    target.write(downloaded.read(to_extract))  # Copy contents to destination
  # Remove zip file
  os.remove(name)
  print("Extracted csv file")
else:
  raise FileTypeNotSupportedError()
