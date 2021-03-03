# Zeggut app

<img src="https://github.com/faridguzman91/zeggut/blob/main/www/icon.png" width ="100px" height="100px">

## Opmerkingen
Er zijn een aantal depenencies aangepast vanaf het phonegap project:
ios is aangepast naar naar 5.1.1
cordova-plugin-inappbrowser naar latest (op het moment van schrijven 4.1.0)
cordova-plugin-wkwebview-engine ook naar latest (op het moment van schrijven 2.2.0)

## Installatie
Ga in een terminal naar de map waar het project staat en draai `npm install` om de depenencies te installeren.

<strong>*Update:</strong> Eerst <code>npm install -g cordova</code> intypen, en zorg daar na dat je PowerShell/Terminal privileges in orde zijn.
Open een terminal met beheerdersrechten en typ in:

<code>Get-ExecutionPolicy -List </code>                                 // Beleid geset voor de user
<br>
<code>Set-ExecutionPolicy RemoteSigned -Scope CurrentUser </code>       // Om de scripts te kunnen runnen met alle rechten
<br>
<code>Set-ExecutionPolicy RemoteSigned -Scope LocalMachine </code>      // Gebruik deze om zeker te weten dat je alle rechten hebt
<br>

<strong>Android</strong>

*Install <strong><a href ="https://redirector.gvt1.com/edgedl/android/studio/install/4.1.2.0/android-studio-ide-201.7042882-windows.exe">Android Studio</a></strong> , en vervolgens alle SDK downloaden vanaf versie 3.7xxx en v 29.0 en hoger (required)
<br>
*Install <a href ="https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html"><strong>Java Development Kit 8</strong></a> (required)
check in je terminal 
<br>
<code> $ java -version </code>
 <br>
*voor cordova-android 6.4, install <strong><a href ="https://gradle.org/next-steps/?version=6.8.2&format=all">Gradle</a></strong> 
of in de terminal
<code>$ sdk install gradle 6.8.2</code> (required)

*Zorg na het installeren dat je Environment Variables goed staan <br>
Open 'Environment Variables' / update jouw <code>PATH</code> variabelen met nieuwe directories: <br>

<em>C:\Users\[username]\AppData\Local\Android\Sdk\platform-tools</em>
<br>
<em>C:\Users\[username]\AppData\Local\Android\Sdk\tools</em>
<br>

Voeg nieuwe variabelen toe: <code><strong>JAVA_HOME</strong></code> en <code><strong>ANDROID_SDK_ROOT</strong></code>, en voeg vervolgens je install directories toe. (java sdk en android sdk)
<br>
Download Gradle, maak een nieuwe <code>C:\Gradle</code> folder aan en unzip alles hier in, daarna voeg je deze in je <code>PATH</code> in je system variables.
<br>
<br>
Eventueel gradle build update met de wrapper <code>gradle -v</code> en <code>gradlew tasks</code>
<br>
Open de <strong>app</strong> folder in Android Studio als nieuw project en open de terminal hier in, en typ <code>cordova build android</code>, om te builden. 

*Extra 
<br> Als de build niet succesvol is, check in file>settings>appearance & behavior>android sdk en check of je alle google sdk's hebt hebt gecheckt en gedownload hebt.
(zie stackoverflow)

*Om de gradle - sdk versies te overridern typ in android studio <code>cordova run android -- --gradleArg=-PcdvMinSdkVersion=20</code> . dit i.v.m. het minimale android sdk versie in de manifest te overriden. wat ik doe is de <code>uses-sdk android:minSdkVersion="22"</code> te declareren in de AndroidManifest.xml.

Om te testen stel je AVD manager in, en test als nodig is op de vroegste versie uit (Android Nougat). zie anders https://developer.android.com/studio/run/managing-avds.html

de <code>gradle.properties</code> in je <code>zeggut/platform/android</code> folder heeft een property <code>cdvMinSdkVersion</code>, deze moet dus naar latest (22)
<br>
om de apk's te builden gebruik je in android terminal <code>cordova build android -- --gradleArg=-PcdvBuildMultipleApks</code> ( '-P' voor 'property')
<br>

<strong> APK's signen </strong>
<br>
Om apk's succesvol te signen moet je zorgen dat <code>keytool</code> in je <code>PATH</code> variables zit, die zit standaard in je bin folder van je Java SDK installatie dir. <code> C:/Program Files/Java/[latest versie]/bin </code>
 
 met keytool kun je een certificaat en keystore maken voor de app met: <br>
 
 <code> keytool -genkey -v -keystore [naamzeggutkeystore].keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias </code> <br>
 //-validity is hoe lang deze cert geldig is (nu is het 10.000 dagen)
 <br>
 //-keyalg is het soort key die je kan gebruiken, RSA is volgens mij default android , DSA werkt niet zo goed met deze package type.
 
 vul in je gegevens en wachtwoord, dan wordt dit certificaat opgeslagen in je root.
 <br> 
 move deze .keystore file in app/platforms/android en voeg deze line in je terminal toe <br>
 
 <code> cordova run android --release -- --keystore=E:/app/platforms/android/[zeggut].keystore --storePassword=[z3ggutp@ssw0rd] --alias=[zeggutalias] --password=[z3ggutp@ssw0rd] --packageType=apk 
 </code>
 
 in <code> E:\app\platforms\android\app\build\outputs\apk\release </code> staat nu je released en gesigneerde apk.

<strong> APK Builds </strong>

om de apk's te builden gebruik je in android terminal <br>

<code>cordova build android -- --gradleArg=-PcdvBuildMultipleApks</code> (dit is voor een debug modus .apk)

om de releasemode .apk te creeren, voeg je signing properties in de <strong>gradle.properties</strong> toe 
bijvoorbeeld:
<br>
<code>org.gradle.daemon=true</code><br>
<code>org.gradle.jvmargs=-Xmx2048m</code><br>
<code>android.useAndroidX=false</code><br>
<code>android.enableJetifier=false</code><br>
<code>cdvMinSdkVersion=19</code><br>
<code>cdvTargetSdkVersion=28</code><br>
<code>storeFile=app/zeggut_keystore/zeggutdemo.keystore</code><br>
<code>storePassword=z3ggut2021</code><br>
<code>storeType=pkcs12</code><br>
<code>keyAlias=zeggutdemoalias</code><br>
<code>keyPassword=z3ggut2021</code><br>
</code>

en dan in de terminal

<code>cordova build android --release </code>


/***********************************************************************************************************************/

<strong>iOS</strong>
<br>
*Download en install XCode in de App Store. <br>

*Open je terminal en zorg dat Homebrew geinstalleerd is<br>

typ <code>/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"</code><br>

daarna <code>$ brew install wget</code><br>

*ga naar je directory met <code>cd</code> vervolgens installeer je met npm de cordova dependency met <code>npm install -g cordova</code> <br>

*Daarna install je benodigde tools om cordova te runnen met: <code> $ xcode-select --install </code> <br>
*Vervolgens om te kunnen deployen, installer ios-deploy <code> $ brew install ios-deploy </code><br>

*Installeer hierna CocoaPods om te kunnen builden <code>$ sudo gem install cocoapods</code>

<br>
<br>
Om de app naar de Simulator te deployen, open je met de terminal de workspace <code>$ open ./platforms/ios/[appnaam].xcworkspace/</code>
selecteer in XCode de simulator links boven de druk op Play.







## Builden
Voeg een platform toe door `cordova add platform ios` of `cordova add platform android` te draaien. De CLI gaat nu de code voor dat platform bijvoegen. Daar daarna `cordova build ios` of `cordova build android` om de applicatie te bouwen.

## Emuleren
Om de app lokaal te testen kun je `cordova emulate ios` of `cordova emulate android` draaien.

### MacOS
Om de app te builden op MacOS heb je een volledige installatie van XCode nodig, deze installeer je in de app store. Na het installeren dien je de command line tools waar standaard een verwijzing naar staat om te zetten naar de volledige installatie, dit doe je met de command `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`. Daarna kun je builden met 
# zeggut 

