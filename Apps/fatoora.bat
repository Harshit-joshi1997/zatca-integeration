@echo off
pushd "%~dp0"

SET "VAR="
FOR /F "tokens=*" %%I IN ('jq.exe .version global.json') DO set "VAR=%%I"

if not defined VAR (
    echo Error: Could not determine SDK version from global.json
    popd
    exit /b 1
)

set "VAR=%VAR:~1,-1%"

if exist "zatca-einvoicing-sdk-%VAR%.jar" (
    call java -Djdk.module.illegalAccess=deny -Dfile.encoding=UTF-8 -jar "zatca-einvoicing-sdk-%VAR%.jar" --globalVersion %VAR% %*
) else (
    echo Error: SDK JAR not found: zatca-einvoicing-sdk-%VAR%.jar
)

popd
