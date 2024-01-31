let city;
function getCity() {
    let lon,
        lat;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (details) {
            lon = details.coords.longitude
            lat = details.coords.latitude
        })
        let apiLink = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ar`;
        return new Promise((res, rej) => {
            let api = new XMLHttpRequest();
            api.open('GET', apiLink, true);
            api.send();
            api.onload = function () {
                if (this.readyState === 4 && this.status === 200) {
                    res(JSON.parse(this.responseText));
                } else {
                    rej(Error('Error in city API'));
                }
            }
        }).then(
            (res) => {
                city = res.city;
                let citySpan = document.getElementById("city");
                citySpan.innerHTML = `مواقيت الصلاة لمدينة ${city}`;
            },
            (rej) => console.log(rej)
        )
    }

}

function islamic() {
    let date = new Date();
    year = date.getFullYear(),
        month = date.getMonth() + 1,
        hour = date.getHours(),
        min = date.getMinutes(),
        day = date.getDate() - 1;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (place) {
            lon = place.coords.longitude
            lat = place.coords.latitude
            let apiLink = `http://api.aladhan.com/v1/calendar?latitude=${lat}&longitude=${lon}&method=5&month=${month}&year=${year}`;
            return new Promise((resolve, reject) => {
                let api = new XMLHttpRequest();
                api.open('GET', apiLink, true);
                api.send();
                api.onload = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        resolve(JSON.parse(this.responseText))
                    } else {
                        reject(Error('islamic api error'));
                    }
                }
            }).then(
                (resolve) => {
                    let dateDiv = document.getElementById("specDate"),
                        monthDiv = document.getElementById("month"),
                        dayDiv = document.getElementById('day'),
                        prayTimesDiv = document.querySelectorAll('.prayTime'),
                        nextPray = document.querySelectorAll('.nextPray'),
                        regExp = /\d+:\d+/gi,
                        hijriDefnition = resolve.data[day].date.hijri;
                    /*
                    Fajr
                    Sunrise
                    Dhuhr
                    Asr
                    Maghrib
                    Isha
                    */
                    function getPrayTime(prayName) {
                        return resolve.data[day].timings[prayName].match(regExp)[0];
                    }
                    dateDiv.innerHTML = hijriDefnition.date;
                    monthDiv.innerHTML = hijriDefnition.month.ar;
                    dayDiv.innerHTML = hijriDefnition.weekday.ar;
                    let prayTimes = [
                        {
                            clock: getPrayTime('Fajr'),
                            hour: getPrayTime('Fajr').match(/\d\d/gi)[0],
                            min: getPrayTime('Fajr').replaceAll(/\d\d:/gi,'')
                        },
                        {
                            clock: getPrayTime('Sunrise'),
                            hour: getPrayTime('Sunrise').match(/\d\d/gi)[0],
                            min: getPrayTime('Sunrise').replaceAll(/\d\d:/gi,'')
                        },
                        {
                            clock: getPrayTime('Dhuhr'),
                            hour: getPrayTime('Dhuhr').match(/\d\d/gi)[0],
                            min: getPrayTime('Dhuhr').replaceAll(/\d\d:/gi,'')
                        },
                        {
                            clock: getPrayTime('Asr'),
                            hour: getPrayTime('Asr').match(/\d\d/gi)[0],
                            min: getPrayTime('Asr').replaceAll(/\d\d:/gi,'')
                        },
                        {
                            clock: getPrayTime('Maghrib'),
                            hour: getPrayTime('Maghrib').match(/\d\d/gi)[0],
                            min: getPrayTime('Maghrib').replaceAll(/\d\d:/gi,'')
                        },
                        {
                            clock: getPrayTime('Isha'),
                            hour: getPrayTime('Isha').match(/\d\d/gi)[0],
                            min: getPrayTime('Isha').replaceAll(/\d\d:/gi,'')
                        },
                    ]
                    for (let j = 0; j < prayTimesDiv.length; j++) {
                        if (prayTimesDiv[j].classList.remove('activeClass'));
                        nextPray[j].innerHTML = '';
                    }
                    for (let i = 0; i < prayTimesDiv.length; i++) {
                        let prayHoursThis = prayTimes[i].hour,
                            prayHoursAfter,
                            prayMinThis = prayTimes[i].min,
                            prayMinAfter;
                        if(!(i === prayTimesDiv.length - 1)){
                            prayHoursAfter = prayTimes[i + 1].hour;
                            prayMinAfter = prayTimes[i + 1].min
                        }else{
                            prayHoursAfter = -1;
                            prayMinAfter = -1;
                        }

                        function correctZero(input) {
                            if ((/0\d/gi).test(input)) {
                                return input[1];
                            } else {
                                return input
                            }
                        }

                        prayHoursThis = +correctZero(prayHoursThis);
                        prayHoursAfter = +correctZero(prayHoursAfter);
                        prayMinThis = +correctZero(prayMinThis);
                        prayMinAfter = +correctZero(prayMinAfter);
                        console.log(min)
                        
                        if ((prayHoursThis <= hour && prayHoursAfter >= hour)) {
                            if(prayMinThis <= min && prayMinAfter >= min){
                                prayTimesDiv[i + 1].parentElement.classList += ' activeClass';
                                nextPray[i + 1].innerHTML = 'الصلاة التالية';
                            }
                        }

                        if(i === prayTimesDiv.length - 1){
                            if(prayHoursThis <= hour && prayMinThis <= min){
                                prayTimesDiv[0].parentElement.classList += ' activeClass';
                                nextPray[0].innerHTML = 'الصلاة التالية';
                            }
                        }
                        
                        function enterTwelveNumber(input){
                            if ((/0\d:/).test(input)) {
                                return `${input} Am`;
                            } else {
                                let hour = input.match(/\d\d/i)[0];
                                // console.log(hour);
                                if(hour > 12){
                                    hour -= 12;
                                    correctHour = input.replaceAll(/\d\d:/g, `0${hour}:`);
                                }else{
                                    correctHour = input.replaceAll(/\d\d:/g, `${hour}:`);
                                    return `${correctHour} Am`;
                                }
                                return `${correctHour} Pm`;
                            }
                        }

                        prayTimesDiv[i].innerHTML = enterTwelveNumber(prayTimes[i].clock);
                    }
                },
                (reject) => {
                    console.log(reject);
                }
            )
        })
    }
}

getCity();

islamic();
