## Movie release notifier

A simple service parses a couple of movie resources and stores data about uocoming digital releases (dvd, hd...) in a mongo database, and when the time will come sends notifications to telegram channel.

To run your own service run 
```
npm install
```
Then create an .env file and fill it up with your data according to .env.example. Then  run
```
npm start
```


