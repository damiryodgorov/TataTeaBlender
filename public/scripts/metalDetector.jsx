import React from 'react';
import ReactDOM from 'react-dom';
const FtiSockIo = require('./ftisockio.js')

/**Opening a websocket connection between the client and server */

var serverURL = 'ws://' +location.host+':3300';
var socket = new FtiSockIo(serverURL,false);
console.log("Location host variable is on MAAXBOARD ",serverURL)

/**GLOBAL VARIABLES DECLARATIONS */
var productHigh = 0;
var productNormal = 0;
var ledDetect = 0;
var ledFault = 0;
var lcdBacklight = 0;
var textValue = "";
var ledPosition = 0;
var cursorPosition = 0;

/**Functions and sockets used to communicate with the server */
function buttonClicked(btnName){
    socket.emit("buttonClicked",btnName);
    console.log(btnName);
    socket.on("buttonClicked",(data)=>{
        console.log("Data for the button "+data);
    })
}
/*function goHomeMenu(){
    window.location="http://"+location.host+"/combo.html";
}*/
function manageDisplayData(data){
    productHigh = data[0];
    productNormal = data[1];
    ledDetect = data[2];
    ledFault = data[3];
    lcdBacklight = data[4];
    textValue = data[5];
    ledPosition = data[6];
    cursorPosition = data[7];

    for(var i = 0; i < 40 ; i++)
    {
        document.getElementsByTagName("td")[i].innerHTML = textValue[i];
        if(document.getElementsByTagName("td")[i].classList.contains("blinkLetter"))
        {
            document.getElementsByTagName("td")[i].classList.remove("blinkLetter");
        }
    }
    if(cursorPosition > 0)
    {
        document.getElementsByTagName("td")[cursorPosition-1].classList.add("blinkLetter");
    }
    /**Turning the signal lights based on the values received */
    if(productHigh == 1){
        document.getElementsByClassName("signalHigh")[0].classList.add("blinkDanger");
    }else{
        document.getElementsByClassName("signalHigh")[0].classList.remove("blinkDanger");
    }
    if(productNormal == 1){
        document.getElementsByClassName("signalNormal")[0].classList.add("blink");
    }else{
        document.getElementsByClassName("signalNormal")[0].classList.remove("blink");
    }
    if(ledDetect == 1){
        document.getElementsByClassName("signalDetect")[0].classList.add("blinkDanger");
    }else{
        document.getElementsByClassName("signalDetect")[0].classList.remove("blinkDanger");
    }
    if(ledFault == 1){
        document.getElementsByClassName("signalFault")[0].classList.add("blinkDanger");
    }else{
        document.getElementsByClassName("signalFault")[0].classList.remove("blinkDanger");
    }
    for(var i = 0; i < 11; i++)
    {
        if(document.getElementsByClassName("dottedSignal")[i].classList.contains("LEDSignalGreen"))
        {
            document.getElementsByClassName("dottedSignal")[i].classList.remove("LEDSignalGreen");
        }
        if(document.getElementsByClassName("dottedSignal")[i].classList.contains("LEDSignalRed"))
        {
            document.getElementsByClassName("dottedSignal")[i].classList.remove("LEDSignalRed");
        }
        if(ledPosition == i)
        {
            if(ledPosition>=5 && ledPosition<=7)
            {
                document.getElementsByClassName("dottedSignal")[i].classList.add("LEDSignalGreen");
            }
            else{
                document.getElementsByClassName("dottedSignal")[i].classList.add("LEDSignalRed");
            }
            
        }
    }
}

socket.on("getPackets",(data)=>{
    manageDisplayData(data);
})

/**CLASS DECLARATIONS START**/


/**Entry point of an application */
class App extends React.Component{
    render(){
        return (
            <Wrapper>
                <Navigation/>
                <MainScreen/>
                <ScrollButtons/>
                <CompanyFooter/>
            </Wrapper>
        )
    }
}
/**Wrapper component for the site which has all components inside */
const Wrapper = (props)=>{
    return(
        <div id="container">
            {props.children}
        </div>
    )
}
/**Navigation Component */
const Navigation = ()=>{
    return (
        <div id="navigation">
            <img className="stealthImage" src={'assets/Stealth-white-01.svg'}/>

            <h3>metal detector</h3>
            <div className="signalScreen">
                <ul>
                    <li className="dottedSignal"></li>
                    <li className="dottedSignal"></li>
                    <li className="dottedSignal"></li>
                    <li className="dottedSignal"></li>
                    <li className="dottedSignal"></li>
                    <li className="dottedSignal"></li>
                    <li className="dottedSignal"></li>
                    <li className="dottedSignal"></li>
                    <li className="dottedSignal"></li>
                    <li className="dottedSignal"></li>
                    <li className="dottedSignal"></li>
                </ul>
            </div>

            <h4 className="detection">detection</h4>
            <ul className="detectionItems">
                <li><div className="whiteBar"></div></li>
                <li><div className="signalDetect"></div></li>
            </ul>

            <div className="productScreen">
                <p className="productText">product</p>
                <div className="signalNormal"></div>
                <p className="normalText">normal</p>
                <div className="signalHigh"></div>
                <p className="highText">high</p>
            </div>
            
            <h4 className="fault">fault</h4>
            <ul className="faultItems">
                <li><div className="signalFault"></div></li>
                <li><div className="whiteBarDot"></div></li>
                <li><div className="whiteBarDot"></div></li>
                <li><div className="whiteBarDot"></div></li>
            </ul>
            {/*<img className='homeButton' src={'assets/home.png'} onClick={goHomeMenu}/>*/}
        </div>
    )
}
/**MainScreen Component */
const MainScreen = (props)=>{
    return(
        <div id="screenSection">
            <div className="mainScreen">
                <table>
                    <tr className="row1">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr className="row2">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </table>
            </div>
            <button className="f1Button" name="f1" alt="submit" onClick={()=>buttonClicked('f1')}><div className="f1ArrowLeft"></div></button>
            <button className="f3Button" name="f3" alt="submit" onClick={()=>buttonClicked('f3')}><div className="f3ArrowLeft"></div></button>
            <button className="f2Button" name="f2" alt="submit" onClick={()=>buttonClicked('f2')}><div className="f2ArrowRight"></div></button>
            <button className="f4Button" name="f4" alt="submit" onClick={()=>buttonClicked('f4')}><div className="f4ArrowRight"></div></button>
        </div>
    )
}
/** ScrollButtons Component*/
const ScrollButtons = ()=>{
    return(
        <div>
            <div id="mainSection">
                <img src={'assets/metalDetector/UShape.png'} className='curvedDiv' />
                <div className="circleForButtons">
                    <button className="plusButton" name="plusButton" onClick={()=>buttonClicked('plusButton')}><div className="arrowUp"><img src={'assets/metalDetector/plusSign.png'} className="cross"/></div></button>
                    <button className="leftArrow" name="leftArrow" onClick={()=>buttonClicked('leftArrow')}><div className="arrowRight"></div></button>
                    <button className="minusButton" name="minusButton" onClick={()=>buttonClicked('minusButton')}><div className="arrowDown"><img src={'assets/metalDetector/minus.png'} className="minus"/></div></button>
                    <button className="rightArrow" name="rightArrow" onClick={()=>buttonClicked('rightArrow')}><div className="arrowLeft"></div></button>
                </div>
            </div>
            <div id="rightSection">
                <button className="sensitivityBtn" name="sensitivityBtn" alt="submit" onClick={()=>buttonClicked('sensitivityBtn')}><div className='circleForButtonRight'></div><span className='btnText'>sensitivity</span></button>
                <button className="selectProductBtn" name="selectProductBtn" alt="submit" onClick={()=>buttonClicked('selectProductBtn')}><div className='circleForButtonRight2'></div><span className='btnText2'>select product</span></button>
                <button className="calibrateBtn" name="calibrateBtn" alt="submit" onClick={()=>buttonClicked('calibrateBtn')}><div className='circleForButtonRight3'></div><span>calibrate</span></button>
                <button className="testBtn" name="testBtn" alt="submit" onClick={()=>buttonClicked('testBtn')}><div className='circleForButtonRight4'></div><span className='btnText4'>test</span></button>
                <button className="selectUnitBtn" name="selectUnitBtn" alt="submit" onClick={()=>buttonClicked('selectUnitBtn')}><div className='circleForButtonRight5'></div><span className='btnText'>select unit</span></button>
            </div>
            <div id="leftSection">
                <button className="enterBtn" name="enterBtn" alt="submit" onClick={()=>buttonClicked('enterBtn')}><div className='circleForButtonLeft'></div><span className='btnTextLeft'>enter</span></button>
                <button className="exitBtn" name="exitBtn" alt="submit" onClick={()=>buttonClicked('exitBtn')}><div className='circleForButtonLeft2'></div><span className='btnTextLeft2'>exit</span></button>
                <button className="menuBtn" name="menuBtn" alt="submit" onClick={()=>buttonClicked('menuBtn')}><div className='circleForButtonLeft3'></div><span className='btnTextLeft3'>menu</span></button>
            </div>
        </div>
    )
}
/**CompanyFooter Component */
const CompanyFooter = ()=>{
    return(
        <div>
            <img src={'assets/metalDetector/fortressLogo.png'} className="fortressLogoImg"/>
        </div>
    )
}
ReactDOM.render(<App />,document.getElementById('content'))