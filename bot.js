import fetch from "node-fetch";
import config from 'config';
import cron from 'node-cron';

const webhookUrl = config.get('webhookurl');

var webHook;

var solPrice;
var sol;
var lunaPrice;
var luna;

var soljunkFloor;
var sjF;
var sjMcS;
var sjMcL;

var smbFloor;
var smbF;
var smbMcS;
var smbMcL;

var facesFloor;
var fF;
var fMcS;
var fMcL;

function convertPrice (labelValue) {

    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

    ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + "B"
    // Six Zeroes for Millions 
    : Math.abs(Number(labelValue)) >= 1.0e+6

    ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2) + "M"
    // Three Zeroes for Thousands
    : Math.abs(Number(labelValue)) >= 1.0e+3

    ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + "K"

    : Math.abs(Number(labelValue));

}

async function ShowMarketcap(url, param) {
    try {
        solPrice = await fetch(`https://api3.binance.com/api/v3/ticker/price?symbol=SOLUSDT`)
            .then(res => res.json())
            .then(json => {
                sol = json.price
                console.log(json.price)
            })
            .catch(error => {
                console.log(error);
            });

        lunaPrice = await fetch(`https://api.coingecko.com/api/v3/coins/terra-luna`)
            .then(res => res.json())
            .then(json => {
                luna = json.market_data.current_price.usd
                console.log(json.market_data.current_price.usd)
            })
            .catch(error => {
                console.log(error);
            });

        soljunkFloor = await fetch(`https://api-mainnet.magiceden.dev/v2/collections/soljunk/stats`)
            .then(res => res.json())
            .then(json => {
                sjF = ((json.floorPrice / 1000000000) * 8888).toFixed(2)
                sjMcS = (((json.floorPrice / 1000000000) * 8888) * sol).toFixed(2)
                sjMcL = (sjMcS / luna).toFixed(2)
                console.log(sjMcS + "$")
            })
            .catch(error => {
                console.log(error);
            });

        smbFloor = await fetch(`https://api-mainnet.magiceden.dev/v2/collections/solana_money_business/stats`)
            .then(res => res.json())
            .then(json => {
                smbF = ((json.floorPrice / 1000000000) * 8888).toFixed(2)
                smbMcS = (((json.floorPrice / 1000000000) * 8888) * sol).toFixed(2)
                smbMcL = (smbMcS / luna).toFixed(2)
                console.log(smbMcS + "$")
            })
            .catch(error => {
                console.log(error);
            });

        facesFloor = await fetch(`https://api-mainnet.magiceden.dev/v2/collections/faces_of_solana_money_business/stats`)
            .then(res => res.json())
            .then(json => {
                fF = ((json.floorPrice / 1000000000) * 8888).toFixed(2)
                fMcS = (((json.floorPrice / 1000000000) * 8888) * sol).toFixed(2)
                fMcL = (fMcS / luna).toFixed(2)
                console.log(smbMcS + "$")
            })
            .catch(error => {
                console.log(error);
            });

        //change '#' to web friendly '%23'
        console.log("Sending Discord Webhook...");
        let settings = { method: "Get" };

        webHook = await fetch(webhookUrl,
            {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: "RarityBot",
                    embeds: [
                        {
                            "image": {
                                "url": `https://gpjk7agxihepalds5czhphaomonvqid3cvhmqzy5uam2oucmdphq.arweave.net/M9KvgNdByPAscuiyd5wOY5tYIHsVTshnHaAZp1BMG88?ext=png`
                            },
                            color: 16759552,
                            title: `SolJunks MarketCap`,
                            fields: [
                                {
                                    "name": `SolJunks`,
                                    "value": `${convertPrice(+(sjF))} \ $SOL\n${convertPrice(+(sjMcL))} \ $LUNA\n${convertPrice(+(sjMcS))} \ $`,
                                },
                                {
                                    "name": "Solana Money Business",
                                    "value": `${convertPrice(+(smbF))} \ $SOL\n${convertPrice(+(smbMcL))} \ $LUNA\n${convertPrice(+(smbMcS))} \ $`,
                                },
                                {
                                    "name": "Faces of Solana Money Business",
                                    "value": `${convertPrice(+(fF))} \ $SOL\n${convertPrice(+(fMcL))} \ $LUNA\n${convertPrice(+(fMcS))} \ $`,
                                },
                            ],
                            footer: {
                                text: 'powered by SolJunks.io',
                            },
                        },
                    ],
                }),
            }
        )
            .catch(error => {
                console.log(error);
            });
        console.log("Webhook sended...")
    } catch (error) {
        console.log("Error thrown, while fetching NFT", error.message);
        fetch(
            webhookUrl,
            {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'MarketcapBot',
                    embeds: [
                        {
                            title: `Error thrown, while fetching NFTs\n${error.message}`,
                        },
                    ],
                }),
            }
        );
    }
}

console.log("CronJob interval set at 5 minutes")
ShowMarketcap()
cron.schedule('*/5 * * * *', () => {
  var today = new Date()
  console.log('\nRunning a task at: ' + today)  
  ShowMarketcap()
})