# Zeggut app

<img src="https://github.com/faridguzman91/zeggut/blob/main/www/icon.png" width ="100px" height="100px">

## Opmerkingen
Er zijn een aantal depenencies aangepast vanaf het phonegap project:
ios is aangepast naar naar 5.1.1
cordova-plugin-inappbrowser naar latest (op het moment van schrijven 4.1.0)
cordova-plugin-wkwebview-engine ook naar latest (op het moment van schrijven 2.2.0)

## Installatie
Ga in een terminal naar de map waar het project staat en draai `npm install` om de depenencies te installeren.

*Update: Eerst <code>npm install -g cordova</code> intypen, en zorg daar na dat je PowerShell/Terminal privileges in orde zijn.
Open een terminal met beheerdersrechten en typ in:

<code>Get-ExecutionPolicy -List </code>                                 // Beleid geset voor de user
<br>
<code>Set-ExecutionPolicy RemoteSigned -Scope CurrentUser </code>       // Om de scripts te kunnen runnen met alle rechten
<br>
<code>Set-ExecutionPolicy RemoteSigned -Scope LocalMachine </code>      // Gebruik deze om zeker te weten dat je alle rechten hebt
<br>

*Install <strong><a href ="https://redirector.gvt1.com/edgedl/android/studio/install/4.1.2.0/android-studio-ide-201.7042882-windows.exe">Android Studio</a></strong> , en vervolgens alle SDK downloaden vanaf versie 3.7xxx en v 29.0 en hoger (required)
<br>
*Install <strong>Java Development Kit 8</strong> (required)
<br>
*voor cordova-android 6.4, install <strong>Gradle</strong> (required)



## Builden
Voeg een platform toe door `cordova add platform ios` of `cordova add platform android` te draaien. De CLI gaat nu de code voor dat platform bijvoegen. Daar daarna `cordova build ios` of `cordova build android` om de applicatie te bouwen.

## Emuleren
Om de app lokaal te testen kun je `cordova emulate ios` of `cordova emulate android` draaien.

### MacOS
Om de app te builden op MacOS heb je een volledige installatie van XCode nodig, deze installeer je in de app store. Na het installeren dien je de command line tools waar standaard een verwijzing naar staat om te zetten naar de volledige installatie, dit doe je met de command `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`. Daarna kun je builden met 
# zeggut 

