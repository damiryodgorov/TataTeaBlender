const React = require('react');
const ReactDOM = require('react-dom')
const ifvisible = require('ifvisible');
var SmoothieChart = require('./smoothie.js').SmoothieChart;
var TimeSeries = require('./smoothie.js').TimeSeries;

var onClickOutside = require('react-onclickoutside');
//var OnClickOutside = require('react-onclickoutside-es6')
import Notifications, {notify} from 'react-notify-toast';
import {ToastContainer, toast,Zoom, cssTransition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {css} from 'glamor'
import FlexText from 'flex-text';
var createReactClass = require('create-react-class');
var createPool = require('reuse-pool')
const _buildVersion = 'display';

const inputSrcArr = ['NONE','TACH','EYE','RC_1','RC_2','REJ_EYE', 'AIR_PRES' ,'REJ_LATCH','BIN_FULL','REJ_PRESENT','DOOR1_OPEN','DOOR2_OPEN','CLEAR_FAULTS','CLEAR_WARNINGS','PHASE_HOLD','CIP_TEST','CIP_PLC','PROD_SEL1', 'PROD_SEL2', 'PROD_SEL3','PROD_SEL4']
const outputSrcArr = ['NONE', 'REJ_MAIN', 'REJ_ALT','FAULT','TEST_REQ', 'HALO_FE','HALO_NFE','HALO_SS','LS_RED','LS_YEL', 'LS_GRN','LS_BUZ','DOOR_LOCK','SHUTDOWN_LANE']

const vdefMapV2 ={
	"@acc":{"SensEdit":1,"Calib":1,"TestButton":1,"ProductButton":1,"ProductEdit":2},"@categories":{"acc":4,"cat":"@root","params":[{"type":1,"val":{"cat":"Reject","params":[{"type":1,"val":{"cat":"Additional Settings","params":[{"type":1,"val":{"cat":"Distances","params":[{"type":0,"val":"AppUnitDist","acc":0},{"type":0,"val":"HeadCoilSp","acc":0},{"type":0,"val":"HeadDepth","acc":0},{"type":0,"val":"EyeDist","acc":0},{"type":0,"val":"RejExitDist","acc":0},{"type":0,"val":"RejExitDistEst","acc":0},{"type":0,"val":"RejExitWin","acc":0},{"type":0,"val":"EyeMinGapDist","acc":0},{"type":0,"val":"HeadSeparation","acc":0}]},"acc":0},{"type":1,"val":{"cat":"Belt Speed","params":[{"type":0,"val":"BeltSpeed","acc":0},{"type":0,"val":"BeltSpeedEst","acc":0},{"type":0,"val":"EyePkgLength","acc":0}]},"acc":0},{"type":1,"val":{"cat":"Latch","params":[{"type":0,"val":"FaultLatch","acc":0},{"type":0,"val":"RejLatchMode","acc":0},{"type":0,"val":"Rej2Latch","acc":0}]},"acc":0},{"type":1,"val":{"cat":"Clocks","params":[{"type":0,"val":"RejBinDoorTime","acc":0},{"type":0,"val":"CIPCycleTime","acc":0},{"type":0,"val":"CIPDwellTime","acc":0},{"type":0,"val":"IsoCleanTimeout","acc":0},{"type":0,"val":"EyeBlockTime","acc":0},{"type":0,"val":"RejCheckTime","acc":0},{"type":0,"val":"ExcessRejTime","acc":0},{"type":0,"val":"RejDelClock","acc":0},{"type":0,"val":"EncFreq","acc":0}]},"acc":0}]},"acc":0},{"type":0,"val":"RejDelSec","acc":0},{"type":0,"val":"RejDurSec","acc":0},{"type":0,"val":"RejDelSec2","acc":0},{"type":0,"val":"RejDurSec2","acc":0},{"type":0,"val":"RejMode","acc":0},{"type":0,"val":"EyeReject","acc":0},{"type":0,"val":"RejCheckMode","acc":0},{"type":0,"val":"FaultRejMode","acc":0},{"type":0,"val":"Rej2Fault","acc":0},{"type":0,"val":"ManRejState","acc":0}]},"acc":0},{"type":1,"val":{"cat":"Fault","params":[{"type":0,"val":"FaultClearTime","acc":0},{"type":0,"val":"RefFaultMask","acc":0},{"type":0,"val":"BalFaultMask","acc":0},{"type":0,"val":"ProdMemFaultMask","acc":0},{"type":0,"val":"RejConfirmFaultMask","acc":0},{"type":0,"val":"PhaseFaultMask","acc":0},{"type":0,"val":"TestSigFaultMask","acc":0},{"type":0,"val":"PeyeBlockFaultMask","acc":0},{"type":0,"val":"RejBinFullFaultMask","acc":0},{"type":0,"val":"AirFaultMask","acc":0},{"type":0,"val":"ExcessRejFaultMask","acc":0},{"type":0,"val":"BigMetalFaultMask","acc":0},{"type":0,"val":"NetBufferFaultMask","acc":0},{"type":0,"val":"RejMemoryFaultMask","acc":0},{"type":0,"val":"RejectExitFaultMask","acc":0},{"type":0,"val":"TachometerFaultMask","acc":0},{"type":0,"val":"PatternFaultMask","acc":0},{"type":0,"val":"ExitNoPackFaultMask","acc":0},{"type":0,"val":"ExitNewPackFaultMask","acc":0},{"type":0,"val":"InterceptorFaultMask","acc":0},{"type":0,"val":"RtcLowBatFaultMask","acc":0},{"type":0,"val":"RtcTimeFaultMask","acc":0},{"type":0,"val":"IntUsbFaultMask","acc":0},{"type":0,"val":"IoBoardFaultMask","acc":0},{"type":0,"val":"HaloFaultMask","acc":0},{"type":0,"val":"SignalFaultMask","acc":0},{"type":0,"val":"RejBinDoorFaultMask","acc":0}]},"acc":0},{"type":1,"val":{"cat":"IO","params":[{"type":1,"val":{"cat":"Inputs","params":[{"type":0,"val":"INPUT_TACH","acc":0},{"type":0,"val":"INPUT_EYE","acc":0},{"type":0,"val":"INPUT_RC_1","acc":0},{"type":0,"val":"INPUT_RC_2","acc":0},{"type":0,"val":"INPUT_REJ_EYE","acc":0},{"type":0,"val":"INPUT_AIR_PRES","acc":0},{"type":0,"val":"INPUT_REJ_LATCH","acc":0},{"type":0,"val":"INPUT_BIN_FULL","acc":0},{"type":0,"val":"INPUT_REJ_PRESENT","acc":0},{"type":0,"val":"INPUT_DOOR1_OPEN","acc":0},{"type":0,"val":"INPUT_DOOR2_OPEN","acc":0},{"type":0,"val":"INPUT_CLEAR_FAULTS","acc":0},{"type":0,"val":"INPUT_CLEAR_WARNINGS","acc":0},{"type":0,"val":"INPUT_PHASE_HOLD","acc":0},{"type":0,"val":"INPUT_CIP","acc":0},{"type":0,"val":"INPUT_CIP_TEST","acc":0},{"type":0,"val":"INPUT_CIP_PLC","acc":0},{"type":0,"val":"INPUT_PROD_SEL1","acc":0},{"type":0,"val":"INPUT_PROD_SEL2","acc":0},{"type":0,"val":"INPUT_PROD_SEL3","acc":0},{"type":0,"val":"INPUT_PROD_SEL4","acc":0},{"type":0,"val":"INPUT_TEST","acc":0}]},"acc":0},{"type":1,"val":{"cat":"Outputs","params":[{"type":0,"val":"OUT_PHY_PL3_1","acc":0},{"type":0,"val":"OUT_PHY_PL11_1A2","acc":0},{"type":0,"val":"OUT_PHY_PL11_3A4","acc":0},{"type":0,"val":"OUT_PHY_PL11_5A6","acc":0},{"type":0,"val":"OUT_PHY_PL4_1","acc":0},{"type":0,"val":"OUT_PHY_PL4_2","acc":0},{"type":0,"val":"OUT_PHY_PL4_3","acc":0},{"type":0,"val":"OUT_PHY_PL4_5","acc":0},{"type":0,"val":"OUT_PHY_IO_PL3_R1","acc":0},{"type":0,"val":"OUT_PHY_IO_PL3_R2","acc":0},{"type":0,"val":"OUT_PHY_IO_PL3_O1","acc":0},{"type":0,"val":"OUT_PHY_IO_PL3_O2","acc":0},{"type":0,"val":"OUT_PHY_IO_PL3_O3","acc":0},{"type":0,"val":"OUT_PHY_IO_PL4_02","acc":0},{"type":0,"val":"OUT_PHY_IO_PL4_03","acc":0},{"type":0,"val":"OUT_PHY_IO_PL4_04","acc":0},{"type":0,"val":"OUT_PHY_IO_PL4_05","acc":0}]},"acc":0}]},"acc":0},{"type":1,"val":{"cat":"System","params":[{"val":{"cat":"SysVersion","child":0,"params":[{"type":0,"val":"SRecordDate","acc":3},{"type":0,"val":"ThresR_A","acc":0},{"type":0,"val":"ThresX_A","acc":0},{"type":1,"val":{"cat":"DCFilter","child":0,"params":[{"type":0,"val":"DCRate_A","acc":0},{"type":0,"val":"DcCoeffNorm_A","acc":0}]},"acc":0}]},"type":2,"acc":0},{"type":0,"val":"DspName","acc":3},{"val":{"cat":"FRAM","params":[{"val":{"child":0,"cat":"Detector IP","params":[{"type":0,"val":"InternalIP","acc":3},{"type":0,"val":"InternalNM","acc":3},{"type":0,"val":"XPortIP","acc":3},{"type":0,"val":"XPortNM","acc":3},{"type":0,"val":"XPortGW","acc":3}]},"type":1,"acc":0},{"val":{"child":1,"cat":"IO Board Settings","params":[{"type":0,"val":"IOBoardLocate","acc":2},{"type":0,"val":"IOBoardIP","acc":3},{"type":0,"val":"IOBoardType","acc":3}]},"type":1,"acc":0},{"val":{"child":1,"cat":"Halo Board Settings","params":[{"type":0,"val":"HaloLocate","acc":2},{"type":0,"val":"HaloIP","acc":3}]},"type":1,"acc":0},{"val":{"child":0,"cat":"Display Settings","params":[{"type":0,"val":"Nif_ip","acc":3},{"type":0,"val":"Nif_nm","acc":3},{"type":0,"val":"Nif_gw","acc":3}]},"type":1,"acc":0},{"type":0,"val":"NTPServerIP","acc":3},{"type":0,"val":"EtherExtPorts","acc":3}]},"type":1,"acc":4},{"val":{"cat":"Passwords","params":[{"type":0,"val":"PassOn","acc":3},{"type":0,"val":"PassAccSens","acc":3},{"type":0,"val":"PassAccProd","acc":3},{"type":0,"val":"PassAccCal","acc":3},{"type":0,"val":"PassAccTest","acc":3},{"type":0,"val":"PassAccSelUnit","acc":3},{"type":0,"val":"PassAccClrFaults","acc":3},{"type":0,"val":"PassAccClrRej","acc":3},{"type":0,"val":"PassAccClrLatch","acc":3},{"type":0,"val":"PassAccTime","acc":3},{"type":0,"val":"PassAccSync","acc":3}]},"type":1,"acc":4},{"val":{"cat":"About","params":[{"type":0,"val":"SysFreq_A","acc":3},{"type":0,"val":"SysBal_A","acc":3},{"type":0,"val":"SysRef_A","acc":3}]},"type":1,"acc":0}]},"acc":0},{"type":0,"val":"Language","acc":0}]},"@vMap":{"Sens_A":{"@translations":{"english":{"name":"Sensitivity","description":"Sensitivity determines the size of metal that can be detected. Higher sensitivity can detect smaller metal, but is also more susceptible to outside noise sources"},"korean":{"name":"민감도","description":""},"spanish":{"name":"Sensibilidad","description":""},"french":{"name":"Sensibilité","description":"La sensibilité détermine la taille du métal pouvant être détecté. Une sensibilité accrue peut détecter une taille plus petite mais rend le détecteur de métaux plus vulnérable aux interférences externes."},"portuguese":{"name":"Sensibilidade","description":""},"italian":{"name":"Sensibilità","description":""},"german":{"name":"Empfinflichkeit","description":"Die Empfindlichkeit bestimmt maßgeblich die Detektionsgenauigkeit des Detektors.Ein höherer Zahlenwert bedeutet Erkennung kleinerer Metallpartikel, umgekehrt kleinerer Zahlenwert nur größerer Metallkontaminationen.Eine zu hoch eingestellte Empfindlichkeit kann zu Instabilitäten und in der Folge zu Fehldetektionen führen."},"turkish":{"name":"Sensitivity","description":"Sensitivity determines the size of metal that can be detected. Higher sensitivity can detect smaller metal, but is also more susceptible to outside noise sources"}},"children":["Sens_B"],"@labels":["Channel A","Channel B"]},"SysFreq_A":{"@translations":{"english":{"name":"Frequency","description":""},"korean":{"name":"주파수","description":""},"spanish":{"name":"Frequency","description":""},"french":{"name":"Fréquence","description":""},"portuguese":{"name":"Frequency","description":""},"italian":{"name":"Frequency","description":""},"german":{"name":"Frequenz","description":""},"turkish":{"name":"Frequency","description":""}},"children":["SysFreq_B"],"@labels":["Channel A","Channel B"]},"SysBal_A":{"@translations":{"english":{"name":"Balance","description":""},"korean":{"name":"발란스","description":""},"spanish":{"name":"Balance","description":""},"french":{"name":"Balance","description":""},"portuguese":{"name":"Balance","description":""},"italian":{"name":"Balance","description":""},"german":{"name":"Balance","description":"Abgleich der Empfangsspulen,Spannungen über 1500mV führen zu einer Störmeldung.Es sollte der Kundendienst gerufen werden."},"turkish":{"name":"Balance","description":""}},"children":["SysBal_B"],"@labels":["Channel A","Channel B"]},"SysRef_A":{"@translations":{"english":{"name":"Reference Voltage","description":""},"korean":{"name":"참조 전압","description":""},"spanish":{"name":"Reference Voltage","description":""},"french":{"name":"Tension de référence","description":""},"portuguese":{"name":"Reference Voltage","description":""},"italian":{"name":"Reference Voltage","description":""},"german":{"name":"Referenz Spannung","description":"Sollspannung liegt hier bei 1-1,5Vss"},"turkish":{"name":"Reference Voltage","description":""}},"children":["SysRef_B"],"@labels":["Channel A","Channel B"]},"DetThresh_A":{"@translations":{"english":{"name":"Detection Threshold","description":"Set the Detection Threshold 1 or 2 above the Detection Threshold Est with product running"},"korean":{"name":"검출역치 ","description":""},"spanish":{"name":"Umbral Detección","description":""},"french":{"name":"Seuil de Détection","description":"Durant la production, fixez le seuil de détection 1 ou 2 au-dessus du seuil estimé."},"portuguese":{"name":"Limite Detecção","description":""},"italian":{"name":"Soglia Rivelamento","description":""},"german":{"name":"Detektions-Schwellenwert","description":"Der Detektions-Schwellenwert ist ca. 1-2 Zahlenwerte über dem höchsten \"Est\"-Wert zu stellen."},"turkish":{"name":"Detection Threshold","description":"Set the Detection Threshold 1 or 2 above the Detection Threshold Est with product running"}},"children":["DetThresh_B"],"@labels":["Channel A","Channel B"]},"DetThresh":{"@translations":{"english":{"name":"Combined Detection Threshold","description":"Set the Detection Threshold 1 or 2 above the Detection Threshold Est with product running"},"korean":{"name":"검출역치 합산 ","description":""},"spanish":{"name":"Combined Detection Threshold","description":""},"french":{"name":"Combined Detection Threshold","description":"Durant la production, fixez le seuil de détection 1 ou 2 au-dessus du seuil estimé."},"portuguese":{"name":"Combined Detection Threshold","description":""},"italian":{"name":"Combined Detection Threshold","description":""},"german":{"name":"Combined Detection Threshold","description":"Der Detektions-Schwellenwert ist ca. 1-2 Zahlenwerte über dem höchsten \"Est\"-Wert zu stellen."},"turkish":{"name":"Combined Detection Threshold","description":"Set the Detection Threshold 1 or 2 above the Detection Threshold Est with product running"}},"children":[],"@labels":["Detection Threshold"]},"ThresProdHi_A":{"@translations":{"english":{"name":"Product High Threshold","description":""},"korean":{"name":"교정한계치","description":""},"spanish":{"name":"Umbral Superior Producto","description":""},"french":{"name":"Seuil Élevé du Produit","description":""},"portuguese":{"name":"Limite Produto Alto","description":""},"italian":{"name":"Soglia alta prodotto","description":""},"german":{"name":"Hoher Produkt-Schwellenwert","description":""},"turkish":{"name":"Product High Threshold","description":""}},"children":["ThresProdHi_B"],"@labels":["Channel A","Channel B"]},"ThresX_A":{"@translations":{"english":{"name":"X Threshold","description":""},"korean":{"name":"X 역치","description":""},"spanish":{"name":"Umbral X","description":""},"french":{"name":"Seuil X","description":""},"portuguese":{"name":"Limite de X","description":""},"italian":{"name":"Soglia X","description":""},"german":{"name":"X-Schwellenwert","description":""},"turkish":{"name":"X Threshold","description":""}},"children":["ThresX_B"],"@labels":["Channel A","Channel B"]},"ThresR_A":{"@translations":{"english":{"name":"R Threshold","description":""},"korean":{"name":"R 역치","description":""},"spanish":{"name":"Umbral R","description":""},"french":{"name":"Seuil R","description":""},"portuguese":{"name":"Limite de R","description":""},"italian":{"name":"Soglia R","description":""},"german":{"name":"R-Schwellenwert","description":""},"turkish":{"name":"R Threshold","description":""}},"children":["ThresR_B"],"@labels":["Channel A","Channel B"]},"BigMetThres_A":{"@translations":{"english":{"name":"Large Metal Threshold","description":"Threshold for Large Metal Fault"},"korean":{"name":"대량금속 역치","description":""},"spanish":{"name":"Umbral Metal Grande","description":""},"french":{"name":"Seuil Grande Quantité de Métaux","description":"Défaillance/Erreur Seuil Grandes Quantités de Métaux"},"portuguese":{"name":"Limite Metal Grande","description":""},"italian":{"name":"Soglia Metallo Grande","description":""},"german":{"name":"Hoher Metall-Schwellenwert","description":"Schwellenwert überschritten! führte zur Fehlermeldung"},"turkish":{"name":"Large Metal Threshold","description":"Threshold for Large Metal Fault"}},"children":["BigMetThres_B"],"@labels":["Channel A","Channel B"]},"DetMode_A":{"@translations":{"english":{"name":"Detection Mode","description":"Peak mode is the default detection mode. FM mode can improve performance in certain applications"},"korean":{"name":"검출방식","description":""},"spanish":{"name":"Modo Detección","description":""},"french":{"name":"Mode Détection","description":"Le Mode de détection Peak est configuré par défaut. Le Mode FM peut améliorer la performance dans certaines applications."},"portuguese":{"name":"Modo de Detecção","description":""},"italian":{"name":"Modo Rivelamento","description":""},"german":{"name":"Detektions Modus","description":"Peak-Modus ist die Standardeinstellung.\nDer FM-Modus kann die Detektionsgenauigkeit in bestimmten Anwendungsfällen deutlich verbessern. "},"turkish":{"name":"Detection Mode","description":"Peak mode is the default detection mode. FM mode can improve performance in certain applications"}},"children":["DetMode_B"],"@labels":["Channel A","Channel B"]},"NoiseR_A":{"@translations":{"english":{"name":"R Channel Noise","description":""},"korean":{"name":"R 채널 노이즈","description":""},"spanish":{"name":"Ruido Canal R","description":""},"french":{"name":"Canal Bruits R","description":""},"portuguese":{"name":"Ruído do Canal R","description":""},"italian":{"name":"Rumore Canale R","description":""},"german":{"name":"R-Kanal Rauschen","description":""},"turkish":{"name":"R Channel Noise","description":""}},"children":["NoiseR_B"],"@labels":["Channel A","Channel B"]},"NoiseX_A":{"@translations":{"english":{"name":"X Channel Noise","description":""},"korean":{"name":"X 채널 노이즈","description":""},"spanish":{"name":"Ruido Canal X","description":""},"french":{"name":"Canal Bruits X","description":""},"portuguese":{"name":"Ruído do canal X","description":""},"italian":{"name":"Rumore Canale X","description":""},"german":{"name":"X-Kanal Rauschen","description":""},"turkish":{"name":"X Channel Noise","description":""}},"children":["NoiseX_B"],"@labels":["Channel A","Channel B"]},"DetThEst_A":{"@translations":{"english":{"name":"Detection Threshold Est","description":"The estimated FM signal; run product to get an estimate of product effect while using FM"},"korean":{"name":"검출역치 추정값","description":""},"spanish":{"name":"Umbral Detección Estimado","description":""},"french":{"name":"Seuil de Détection Estimé","description":"Le signal FM estimé; En Mode FM, faites passer le produit pour obtenir une estimation de l'effet du produit."},"portuguese":{"name":"Est do Limite de Detecção","description":""},"italian":{"name":"Soglia Rivelamento Stimata","description":""},"german":{"name":"Detektions Schwellenwert \"Est\"","description":"Das annäherungsweise ermittelte FM-Signal;Produkt durch die Öffnung laufen lassen um das FM-Signal zu bestimmen."},"turkish":{"name":"Detection Threshold Est","description":"The estimated FM signal; run product to get an estimate of product effect while using FM"}},"children":["DetThEst_B"],"@labels":["Channel A","Channel B"]},"DetThEst":{"@translations":{"english":{"name":"Combined Detection Threshold Est","description":"The estimated FM signal; run product to get an estimate of product effect while using FM"},"korean":{"name":"Combined Detection Threshold Est","description":""},"spanish":{"name":"Combined Detection Threshold Est","description":""},"french":{"name":"Combined Detection Threshold Est","description":"Le signal FM estimé; En Mode FM, faites passer le produit pour obtenir une estimation de l'effet du produit."},"portuguese":{"name":"Combined Detection Threshold Est","description":""},"italian":{"name":"Combined Detection Threshold Est","description":""},"german":{"name":"Combined Detection Threshold Est","description":"Das annäherungsweise ermittelte FM-Signal;Produkt durch die Öffnung laufen lassen um das FM-Signal zu bestimmen."},"turkish":{"name":"Combined Detection Threshold Est","description":"The estimated FM signal; run product to get an estimate of product effect while using FM"}},"children":[],"@labels":["Det Threshold Estimate"]},"FilterNoise_A":{"@translations":{"english":{"name":"Filter ","description":"filters prevent external noise from accidentally causing a false reject. Care should be taken that after a new filter is applied, the required metal samples can still be detected; a manual test is strongly reccommended after changes."},"korean":{"name":"필터 노이즈","description":""},"spanish":{"name":"Filtro Ruido","description":""},"french":{"name":"Filtre","description":"Les filtres préviennent les faux rejets causés accidentellement par les bruits externes. Une attention particulière doit être apportée après l’installation d’un nouveau filtre, il faut s'assurer que l'échantillon de métal peut encore être détecté; il est fortement recommandé de procéder à un test de détection manuel."},"portuguese":{"name":"Filtro do Ruído","description":""},"italian":{"name":"Rumore Filtro","description":""},"german":{"name":"Filter ","description":"Die Filter verhindern,das elektromagnetische Störungen, zu Fehldetektionen führen und somit die Betriebsstabilität zu verbessern.Nach einer Einstellungsänderung sollte immer mittels der Testkörper geprüft werden ob die erforderliche Detektionsgenauigkeit noch gewährleistet ist."},"turkish":{"name":"Filter ","description":"filters prevent external noise from accidentally causing a false reject. Care should be taken that after a new filter is applied, the required metal samples can still be detected; a manual test is strongly reccommended after changes."}},"children":["FilterNoise_B"],"@labels":["Channel A","Channel B"]},"OscPower_A":{"@translations":{"english":{"name":"Oscillator Power","description":"The oscillator power is set to high by default, but may be changed to low to accomodate for high product signal. Always recalibrate & run a manual test after changing the oscillator power"},"korean":{"name":"진동 출력","description":""},"spanish":{"name":"Potencia Oscilación","description":""},"french":{"name":"Puissance Oscillateur","description":"La puissance de l'oscillateur est préréglée \"High\" par défaut mais peut être modifiée à \"Low\" pour composer avec un signal élevé d'un produit. Toujours recalibrer et exécuter un test manuel après un changement de la puissance de l'oscillateur"},"portuguese":{"name":"Potência","description":""},"italian":{"name":"Potenza Oscillatore","description":""},"german":{"name":"Oszillator-Leistung","description":"Die Oszillator-Leistung steht standardmäßig auf hoch. Kann jedoch bei hohem Produkteffekt und Schwierigkeiten bei der Produkteffektkompensation auf niedrig gestellt werden. Nach Wechsel der Einstellung sollte immer eine Kalbrierung und ein Test mit den Prüfkörpern erfolgen."},"turkish":{"name":"Oscillator Power","description":"The oscillator power is set to high by default, but may be changed to low to accomodate for high product signal. Always recalibrate & run a manual test after changing the oscillator power"}},"children":["OscPower_B"],"@labels":["Channel A","Channel B"]},"FmInput_A":{"@translations":{"english":{"name":"FM Signal","description":"Signal in FM mode. "},"korean":{"name":"FM 입력","description":""},"spanish":{"name":"Entrada FM ","description":""},"french":{"name":"Signal FM","description":"Signal en Mode FM"},"portuguese":{"name":"Input do FM ","description":""},"italian":{"name":"Ingresso FM","description":""},"german":{"name":"FM Signal","description":"Signal in FM mode. "},"turkish":{"name":"FM Signal","description":"Signal in FM mode. "}},"children":["FmInput_B"],"@labels":["Channel A","Channel B"]},"TestTime":{"@translations":{"english":{"name":"Test Interval","description":"Time between automatically run tests in minutes. When set to \"0\" tests must be manually run through the test menu"},"korean":{"name":"테스트 간격","description":""},"spanish":{"name":"Intervalo Test","description":""},"french":{"name":"Intervalle  Essai/Test","description":"L'Auto Test s'exécute en temps minute. Lorsqu’il y a mise à 0, le test doit être exécuté manuellement à partir du menu d'Essai/Test"},"portuguese":{"name":"Intervalo de Teste","description":""},"italian":{"name":"Intervallo Test","description":""},"german":{"name":"Test Intervall","description":"Zeit zwischen automatischen Tests in Minuten. Wenn auf \"0\" gesetzt, müssen Tests manuell durch das Testmenü durchgeführt werden"},"turkish":{"name":"Test Interval","description":"Time between automatically run tests in minutes. When set to \"0\" tests must be manually run through the test menu"}},"children":[],"@labels":["Test Interval"]},"TestDeferTime":{"@translations":{"english":{"name":"Test Defer TIme","description":"Test defer time sets the interval between tests if multiple tests have been configured"},"korean":{"name":"테스트 지연 시간","description":""},"spanish":{"name":"Tiempo Aplazamiento Test","description":""},"french":{"name":"Un Temps d'Essai/Test Différé","description":"Un Temps d'Essai/Test Différé détermine l'intervalle entre les Essais/Tests si plusieurs requêtes d'Essai/Test ont été configurées."},"portuguese":{"name":"Deferir Tempo de Teste","description":""},"italian":{"name":"Tempo Differire Test","description":""},"german":{"name":"Testverzögerungszeit","description":"Die Testverzögerungszeit legt das Intervall zwischen den Tests fest, wenn mehrere Tests konfiguriert wurden"},"turkish":{"name":"Test Defer TIme","description":"Test defer time sets the interval between tests if multiple tests have been configured"}},"children":[],"@labels":["Test Defer TIme"]},"TestMode":{"@translations":{"english":{"name":"Test Mode","description":"Sets the test run when triggered by the test input. Prompt allows users to select test manually, halo & halo2 options require an optional Halo Board, Manual and Manual2 options prompt operator to run selected number of metal types for test."},"korean":{"name":"테스트 방식","description":""},"spanish":{"name":"Modo Test","description":""},"french":{"name":"Mode Essai/Test","description":"Déclenche l'Essai/test lorsqu’actionner \"Test Input\". Cette fonctionnalité permet à l'utilisateur de sélectionner un Essai/Test manuel, Halo et Halo 2 nécessite un Panneau Halo optionnel, l’option Manuel et Manuel 2 demande à l’opérateur de passer un nombre déterminé de types de métal à tester."},"portuguese":{"name":"Modo do Teste","description":""},"italian":{"name":"Modo Test","description":""},"german":{"name":"Test-Modus","description":"Startet den Testablauf, wenn dieser vom Signal eines vordefinfierten Eingangs angefordert wird. Die Eingabeaufforderung ermöglicht Benutzern die manuelle Auswahl eines Tests. Halo & Halo2-Optionen erfordern ein optionales Halo Board.Die Optionen Manuell und Manuell2 ermöglichen dem Bediener, die Art des Metalls für den Test,sowie die Testhäufigkeit zu definieren."},"turkish":{"name":"Test Mode","description":"Sets the test run when triggered by the test input. Prompt allows users to select test manually, halo & halo2 options require an optional Halo Board, Manual and Manual2 options prompt operator to run selected number of metal types for test."}},"children":[],"@labels":["Test Mode"]},"TestConfigCount0_0":{"@translations":{"english":{"name":"Test 1","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 1","description":""},"spanish":{"name":"Test 1","description":"Cuenta es el número de pasadas. Selecciona el Tipo de Metal para testear en el cadena de señal específico"},"french":{"name":"Essai/Test 1","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne de signal \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 1","description":"Count is number of passes. Select Metal Type to test on the specified signal chain"},"italian":{"name":"Test 1","description":""},"german":{"name":"Test 1","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 1","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal0_0"],"@labels":["Count","Metal Type"]},"TestConfigCount0_1":{"@translations":{"english":{"name":"Test 2","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 2","description":""},"spanish":{"name":"Test 2","description":""},"french":{"name":"Essai/Test 2","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne de signal \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 2","description":""},"italian":{"name":"Test 2","description":""},"german":{"name":"Test 2","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 2","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal0_1"],"@labels":["Count","Metal Type"]},"TestConfigCount0_2":{"@translations":{"english":{"name":"Test 3","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 3","description":""},"spanish":{"name":"Test 3","description":""},"french":{"name":"Essai/Test 3","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne de signal \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 3","description":""},"italian":{"name":"Test 3","description":""},"german":{"name":"Test 3","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 3","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal0_2"],"@labels":["Count","Metal Type"]},"TestConfigCount0_3":{"@translations":{"english":{"name":"Test 4","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 4","description":""},"spanish":{"name":"Test 4","description":""},"french":{"name":"Essai/Test 4","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne de signal \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 4","description":""},"italian":{"name":"Test 4","description":""},"german":{"name":"Test 4","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 4","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal0_3"],"@labels":["Count","Metal Type"]},"TestConfigCount0_4":{"@translations":{"english":{"name":"Test 5","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 5","description":""},"spanish":{"name":"Test 5","description":""},"french":{"name":"Essai/Test 5","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne de signal \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 5","description":""},"italian":{"name":"Test 5","description":""},"german":{"name":"Test 5","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 5","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal0_4"],"@labels":["Count","Metal Type"]},"TestConfigCount0_5":{"@translations":{"english":{"name":"Test 6","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 6","description":""},"spanish":{"name":"Test 6","description":""},"french":{"name":"Essai/Test 6","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne de signal \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 6","description":""},"italian":{"name":"Test 6","description":""},"german":{"name":"Test 6","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 6","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal0_5"],"@labels":["Count","Metal Type"]},"TestConfigAck0":{"@translations":{"english":{"name":"Acknowledge Test","description":"when set to \"on\" requires user to press key to acknowledge test between each test"},"korean":{"name":"확인","description":""},"spanish":{"name":"Reconocer","description":""},"french":{"name":"Confirmation Test","description":"En position \"ON\", il oblige l'utilisateur à appuyer sur la touche de confirmation Essai/Test entre chaque Essai/Test."},"portuguese":{"name":"Reconhecer","description":""},"italian":{"name":"Riconoscere","description":""},"german":{"name":"Test Bestätigung","description":"Wenn auf \"an\" eingestellt ist, muss der Benutzer die Taste drücken, um den Test zwischen den einzelnen Tests zu bestätigen"},"turkish":{"name":"Acknowledge Test","description":"when set to \"on\" requires user to press key to acknowledge test between each test"}},"children":[],"@labels":["Acknowledge"]},"TestConfigOperator0":{"@translations":{"english":{"name":"Operator Code","description":"When set to \"on\" requires user to enter their operator code before running the test"},"korean":{"name":"승인","description":""},"spanish":{"name":"Operador","description":""},"french":{"name":"Code Opérateur","description":"En position \"ON\", il oblige l'utilisateur à entrer son code d'opérateur avant d'effectuer l'Essai/Test"},"portuguese":{"name":"Operador","description":""},"italian":{"name":"Operatore","description":""},"german":{"name":"Bnutzer-Code","description":"Wenn auf \"an\" gesetzt ist, muss der Benutzer seinen Bedienercode eingeben, bevor er den Test ausführt"},"turkish":{"name":"Operator Code","description":"When set to \"on\" requires user to enter their operator code before running the test"}},"children":[],"@labels":["Operator"]},"TestConfigHaloMode0":{"@translations":{"english":{"name":"Halo Mode","description":"Sets the simulated metal sample to the middle (mid) or leading edge, middle, and trailing edge (cycle) of product"},"korean":{"name":"헤일로 모드","description":""},"spanish":{"name":"Modo Halo","description":""},"french":{"name":"Mode Halo","description":"Place l'Échantillon-Test vers le milieu (mid), ou le bord avant, milieu et le bord arrière (cycle) du produit."},"portuguese":{"name":"Modo Halo","description":""},"italian":{"name":"Modo Halo","description":""},"german":{"name":"Halo-Modus","description":"Setzt die simulierte Metallprobe auf die mittlere (Mitte) oder Vorderkante, mittlere und hintere Kante (Zyklus) des Produkts"},"turkish":{"name":"Halo Mode","description":"Sets the simulated metal sample to the middle (mid) or leading edge, middle, and trailing edge (cycle) of product"}},"children":[],"@labels":["Halo Mode"]},"TestConfigCount1_0":{"@translations":{"english":{"name":"Test 1","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Essai/Test 1","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 1","description":""},"italian":{"name":"Test 1","description":""},"german":{"name":"Test 1","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 1","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal1_0"],"@labels":["Count","Metal Type"]},"TestConfigCount1_1":{"@translations":{"english":{"name":"Test 2","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 2","description":""},"spanish":{"name":"Test 2","description":""},"french":{"name":"Essai/Test 2","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 2","description":""},"italian":{"name":"Test 2","description":""},"german":{"name":"Test 2","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 2","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal1_1"],"@labels":["Count","Metal Type"]},"TestConfigCount1_2":{"@translations":{"english":{"name":"Test 3","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 3","description":""},"spanish":{"name":"Test 3","description":""},"french":{"name":"Essai/Test 3","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 3","description":""},"italian":{"name":"Test 3","description":""},"german":{"name":"Test 3","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 3","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal1_2"],"@labels":["Count","Metal Type"]},"TestConfigCount1_3":{"@translations":{"english":{"name":"Test 4","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 4","description":""},"spanish":{"name":"Test 4","description":""},"french":{"name":"Essai/Test 4","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 4","description":""},"italian":{"name":"Test 4","description":""},"german":{"name":"Test 4","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 4","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal1_3"],"@labels":["Count","Metal Type"]},"TestConfigCount1_4":{"@translations":{"english":{"name":"Test 5","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 5","description":""},"spanish":{"name":"Test 5","description":""},"french":{"name":"Essai/Test 5","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 5","description":""},"italian":{"name":"Test 5","description":""},"german":{"name":"Test 5","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 5","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal1_4"],"@labels":["Count","Metal Type"]},"TestConfigCount1_5":{"@translations":{"english":{"name":"Test 6","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 6","description":""},"spanish":{"name":"Test 6","description":""},"french":{"name":"Essai/Test 6","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 6","description":""},"italian":{"name":"Test 6","description":""},"german":{"name":"Test 6","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 6","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal1_5"],"@labels":["Count","Metal Type"]},"TestConfigAck1":{"@translations":{"english":{"name":"Acknowledge Test","description":"when set to \"on\" requires user to press key to acknowledge test between each test"},"korean":{"name":"확인","description":""},"spanish":{"name":"Reconocer","description":""},"french":{"name":"Confirmation Test","description":"En position \"ON\", il oblige l'utilisateur à appuyer sur la touche de confirmation Essai/Test entre chaque Essai/Test."},"portuguese":{"name":"Reconhecer","description":""},"italian":{"name":"Riconoscere","description":""},"german":{"name":" Test-Bestätigung","description":"Wenn auf \"an\" eingestellt ist, muss der Benutzer die Taste drücken, um den Test zwischen den einzelnen Tests zu bestätigen"},"turkish":{"name":"Acknowledge Test","description":"when set to \"on\" requires user to press key to acknowledge test between each test"}},"children":[],"@labels":["Acknowledge"]},"TestConfigOperator1":{"@translations":{"english":{"name":"Operator Code","description":"When set to \"on\" requires user to enter their operator code before running the test"},"korean":{"name":"승인","description":""},"spanish":{"name":"Operador","description":""},"french":{"name":"Code Opérateur","description":"En position \"ON\", il oblige l'utilisateur à entrer son code d'opérateur avant d'effectuer l'Essai/Test"},"portuguese":{"name":"Operador","description":""},"italian":{"name":"Operatore","description":""},"german":{"name":"Benutzer-Code","description":"Wenn auf \"an\" gesetzt ist, muss der Benutzer seinen Bedienercode eingeben, bevor er den Test ausführt"},"turkish":{"name":"Operator Code","description":"When set to \"on\" requires user to enter their operator code before running the test"}},"children":[],"@labels":["Operator"]},"TestConfigHaloMode1":{"@translations":{"english":{"name":"Halo Mode","description":"Sets the simulated metal sample to the middle (mid) or leading edge, middle, and trailing edge (cycle) of product"},"korean":{"name":"헤일로 모드","description":""},"spanish":{"name":"Modo Halo","description":""},"french":{"name":"Mode Halo","description":"Place l'Échantillon-Test vers le milieu (mid), ou le bord avant, milieu et le bord arrière (cycle) du produit."},"portuguese":{"name":"Modo Halo","description":""},"italian":{"name":"Modo Halo","description":""},"german":{"name":"Halo-Modus","description":"Setzt die simulierte Metallprobe auf die mittlere (Mitte) oder Vorderkante, mittlere und hintere Kante (Zyklus) des Produkts"},"turkish":{"name":"Halo Mode","description":"Sets the simulated metal sample to the middle (mid) or leading edge, middle, and trailing edge (cycle) of product"}},"children":[],"@labels":["Halo Mode"]},"TestConfigCount2_0":{"@translations":{"english":{"name":"Test 1","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Essai/Test 1","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 1","description":""},"italian":{"name":"Test 1","description":""},"german":{"name":"Test 1","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 1","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal2_0"],"@labels":["Count","Metal Type"]},"TestConfigCount2_1":{"@translations":{"english":{"name":"Test 2","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 2","description":""},"spanish":{"name":"Test 2","description":""},"french":{"name":"Essai/Test 2","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 2","description":""},"italian":{"name":"Test 2","description":""},"german":{"name":"Test 2","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 2","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal2_1"],"@labels":["Count","Metal Type"]},"TestConfigCount2_2":{"@translations":{"english":{"name":"Test 3","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 3","description":""},"spanish":{"name":"Test 3","description":""},"french":{"name":"Essai/Test 3","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 3","description":""},"italian":{"name":"Test 3","description":""},"german":{"name":"Test 3","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 3","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal2_2"],"@labels":["Count","Metal Type"]},"TestConfigCount2_3":{"@translations":{"english":{"name":"Test 4","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 4","description":""},"spanish":{"name":"Test 4","description":""},"french":{"name":"Essai/Test 4","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 4","description":""},"italian":{"name":"Test 4","description":""},"german":{"name":"Test 4","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 4","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal2_3"],"@labels":["Count","Metal Type"]},"TestConfigCount2_4":{"@translations":{"english":{"name":"Test 5","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 5","description":""},"spanish":{"name":"Test 5","description":""},"french":{"name":"Essai/Test 5","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 5","description":""},"italian":{"name":"Test 5","description":""},"german":{"name":"Test 5","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 5","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal2_4"],"@labels":["Count","Metal Type"]},"TestConfigCount2_5":{"@translations":{"english":{"name":"Test 6","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 6","description":""},"spanish":{"name":"Test 6","description":""},"french":{"name":"Essai/Test 6","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 6","description":""},"italian":{"name":"Test 6","description":""},"german":{"name":"Test 6","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 6","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal2_5"],"@labels":["Count","Metal Type"]},"TestConfigAck2":{"@translations":{"english":{"name":"Acknowledge Test","description":"when set to \"on\" requires user to press key to acknowledge test between each test"},"korean":{"name":"확인","description":""},"spanish":{"name":"Reconocer","description":""},"french":{"name":"Confirmation Test","description":"En position \"ON\", il oblige l'utilisateur à appuyer sur la touche de confirmation Essai/Test entre chaque Essai/Test"},"portuguese":{"name":"Reconhecer","description":""},"italian":{"name":"Riconoscere","description":""},"german":{"name":"Test Bestätigung","description":"Wenn auf \"an\" eingestellt ist, muss der Benutzer die Taste drücken, um den Test zwischen den einzelnen Tests zu bestätigen"},"turkish":{"name":"Acknowledge Test","description":"when set to \"on\" requires user to press key to acknowledge test between each test"}},"children":[],"@labels":["Acknowledge"]},"TestConfigOperator2":{"@translations":{"english":{"name":"Operator Code","description":"When set to \"on\" requires user to enter their operator code before running the test"},"korean":{"name":"승인","description":""},"spanish":{"name":"Operador","description":""},"french":{"name":"Code Opétateur","description":"En position \"ON\", il oblige l'utilisateur à entrer son code d'opérateur avant d'effectuer l'Essai/Test"},"portuguese":{"name":"Operador","description":""},"italian":{"name":"Operatore","description":""},"german":{"name":"Benutzer-Code","description":"Wenn auf \"an\" gesetzt ist, muss der Benutzer seinen Bedienercode eingeben, bevor er den Test ausführt"},"turkish":{"name":"Operator Code","description":"When set to \"on\" requires user to enter their operator code before running the test"}},"children":[],"@labels":["Operator"]},"TestConfigHaloMode2":{"@translations":{"english":{"name":"Halo Mode","description":"Sets the simulated metal sample to the middle (mid) or leading edge, middle, and trailing edge (cycle) of product"},"korean":{"name":"헤일로 모드","description":""},"spanish":{"name":"Modo Halo","description":""},"french":{"name":"Mode Halo","description":"Place l'Échantillon-Test vers le milieu (mid), ou le bord avant, milieu et le bord arrière (cycle) du produit."},"portuguese":{"name":"Modo Halo","description":""},"italian":{"name":"Modo Halo","description":""},"german":{"name":"Halo-Modus","description":"Setzt die simulierte Metallprobe auf die mittlere (Mitte) oder Vorderkante, mittlere und hintere Kante (Zyklus) des Produkts"},"turkish":{"name":"Halo Mode","description":"Sets the simulated metal sample to the middle (mid) or leading edge, middle, and trailing edge (cycle) of product"}},"children":[],"@labels":["Halo Mode"]},"TestConfigCount3_0":{"@translations":{"english":{"name":"Test 1","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Essai/Test 1","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 1","description":""},"italian":{"name":"Test 1","description":""},"german":{"name":"Test 1","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 1","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal3_0"],"@labels":["Count","Metal Type"]},"TestConfigCount3_1":{"@translations":{"english":{"name":"Test 2","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 2","description":""},"spanish":{"name":"Test 2","description":""},"french":{"name":"Essai/Test 2","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 2","description":""},"italian":{"name":"Test 2","description":""},"german":{"name":"Test 2","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 2","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal3_1"],"@labels":["Count","Metal Type"]},"TestConfigCount3_2":{"@translations":{"english":{"name":"Test 3","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 3","description":""},"spanish":{"name":"Test 3","description":""},"french":{"name":"Essai/Test 3","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 3","description":""},"italian":{"name":"Test 3","description":""},"german":{"name":"Test 3","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 3","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal3_2"],"@labels":["Count","Metal Type"]},"TestConfigCount3_3":{"@translations":{"english":{"name":"Test 4","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 4","description":""},"spanish":{"name":"Test 4","description":""},"french":{"name":"Essai/Test 4","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 4","description":""},"italian":{"name":"Test 4","description":""},"german":{"name":"Test 4","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 4","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal3_3"],"@labels":["Count","Metal Type"]},"TestConfigCount3_4":{"@translations":{"english":{"name":"Test 5","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 5","description":""},"spanish":{"name":"Test 5","description":""},"french":{"name":"Essai/Test 5","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 5","description":""},"italian":{"name":"Test 5","description":""},"german":{"name":"Test 5","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 5","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal3_4"],"@labels":["Count","Metal Type"]},"TestConfigCount3_5":{"@translations":{"english":{"name":"Test 6","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"},"korean":{"name":"테스트 6","description":""},"spanish":{"name":"Test 6","description":""},"french":{"name":"Essai/Test 6","description":"Le chiffre indique le nombre de d'Essai/Test, le type de métal peut être ferreux (FE), non-ferreux (NFE) ou acier Inoxydable (SS). La chaîne signalétique \"Chain Signal\" sélectionnera l'unité A ou B"},"portuguese":{"name":"Teste 6","description":""},"italian":{"name":"Test 6","description":""},"german":{"name":"Test 6","description":"Anzahl bezieht sich auf die Anzahl der Tests, Metalltyp kann Eisen (Fe), Nicht-Eisen (nFe) oder Edelstahl (SS) sein, Signalkette wählt die Einheit A oder B"},"turkish":{"name":"Test 6","description":"Count refers to the number of tests, metal type can be ferrous (FE), non-ferrous (NFE), or stainless (SS), Signal chain selects unit A or B"}},"children":["TestConfigMetal3_5"],"@labels":["Count","Metal Type"]},"Date":{"@translations":{"english":{"name":"Date","description":""},"korean":{"name":"날짜","description":""},"spanish":{"name":"Date","description":""},"french":{"name":"Date","description":""},"portuguese":{"name":"Date","description":""},"italian":{"name":"Date","description":""},"german":{"name":"Date","description":""},"turkish":{"name":"Date","description":""}},"children":["months","days"],"@labels":["Year","Month","Day"]},"Time":{"@translations":{"english":{"name":"Time","description":""},"korean":{"name":"시간","description":""},"spanish":{"name":"Time","description":""},"french":{"name":"Time","description":""},"portuguese":{"name":"Time","description":""},"italian":{"name":"Time","description":""},"german":{"name":"Time","description":""},"turkish":{"name":"Time","description":""}},"children":["minute","second"],"@labels":["Hour","Minute","Second"]},"TestConfigAck3":{"@translations":{"english":{"name":"Acknowledge Test","description":"when set to \"on\" requires user to press key to acknowledge test between each test"},"korean":{"name":"확인","description":""},"spanish":{"name":"Reconocer","description":""},"french":{"name":"Confirmation Test","description":"En position \"ON\", il oblige l'utilisateur à appuyer sur la touche de confirmation Essai/Test entre chaque Essai/Test"},"portuguese":{"name":"reconhecer","description":""},"italian":{"name":"Riconoscere","description":""},"german":{"name":"Test Bestätigung","description":"Wenn auf \"an\" gesetzt ist, muss der Benutzer seinen Bedienercode eingeben, bevor er den Test ausführt"},"turkish":{"name":"Acknowledge Test","description":"when set to \"on\" requires user to press key to acknowledge test between each test"}},"children":[],"@labels":["Acknowledge"]},"TestConfigOperator3":{"@translations":{"english":{"name":"Operator Code","description":"When set to \"on\" requires user to enter their operator code before running the test"},"korean":{"name":"승인","description":""},"spanish":{"name":"Operador","description":""},"french":{"name":"Code Opérateur","description":"En position \"ON\", il oblige l'utilisateur à entrer son code d'opérateur avant d'effectuer l'Essai/Test"},"portuguese":{"name":"Operador","description":""},"italian":{"name":"Operatore","description":""},"german":{"name":"Benutzer Code","description":"Wenn auf \"an\" gesetzt ist, muss der Benutzer seinen Bedienercode eingeben, bevor er den Test ausführt"},"turkish":{"name":"Operator Code","description":"When set to \"on\" requires user to enter their operator code before running the test"}},"children":[],"@labels":["Operator"]},"TestConfigHaloMode3":{"@translations":{"english":{"name":"Halo Mode","description":"Sets the simulated metal sample to the middle (mid) or leading edge, middle, and trailing edge (cycle) of product"},"korean":{"name":"헤일로 모드","description":""},"spanish":{"name":"Modo Halo","description":""},"french":{"name":"Mode Halo","description":"Place l'Échantillon-Test vers le milieu (mid), ou le bord avant, milieu et le bord arrière (cycle) du produit."},"portuguese":{"name":"Modo Halo","description":""},"italian":{"name":"Modo Halo","description":""},"german":{"name":"Halo-Modus","description":"Setzt die simulierte Metallprobe auf die mittlere (Mitte) oder Vorderkante, mittlere und hintere Kante (Zyklus) des Produkts"},"turkish":{"name":"Halo Mode","description":"Sets the simulated metal sample to the middle (mid) or leading edge, middle, and trailing edge (cycle) of product"}},"children":[],"@labels":["Halo Mode"]},"TestBlockReject":{"@translations":{"english":{"name":"Reject Disable on Test","description":""},"korean":{"name":"테스트시 리젝트 해제","description":""},"spanish":{"name":"Reject Disable on Test","description":""},"french":{"name":"Reject Disable on Test","description":""},"portuguese":{"name":"Reject Disable on Test","description":""},"italian":{"name":"Reject Disable on Test","description":""},"german":{"name":"Reject Disable on Test","description":""},"turkish":{"name":"Reject Disable on Test","description":""}},"children":[],"@labels":["Halo Mode"]},"HaloPeakRFe_A":{"@translations":{"english":{"name":"Ferrous Peak A","description":""},"korean":{"name":"철분 피크 A","description":""},"spanish":{"name":"Pico Ferrorso A","description":""},"french":{"name":"Limite Supérieure Ferreux A","description":""},"portuguese":{"name":"Pico Ferroso A","description":""},"italian":{"name":"Picco Ferroso A","description":""},"german":{"name":"Ferrous Peak A","description":""},"turkish":{"name":"Ferrous Peak A","description":""}},"children":["HaloPeakXFe_A"],"@labels":["Channel R","Channel X"]},"HaloPeakRFe_B":{"@translations":{"english":{"name":"Ferrous Peak B","description":""},"korean":{"name":"철분 피크 B","description":""},"spanish":{"name":"Pico Ferroso B","description":""},"french":{"name":"Limite Supérieure Ferreux B","description":""},"portuguese":{"name":"Pico Ferroso B","description":""},"italian":{"name":"Picco Ferroso B","description":""},"german":{"name":"Ferrous Peak B","description":""},"turkish":{"name":"Ferrous Peak B","description":""}},"children":["HaloPeakXFe_B"],"@labels":["Channel A","Channel B"]},"HaloPeakRNFe_A":{"@translations":{"english":{"name":"Non-Ferrous Peak A","description":""},"korean":{"name":"비철금속 피크 A","description":""},"spanish":{"name":"Pico No Ferroso A","description":""},"french":{"name":"Limite Supérieure Non-Ferreux A","description":""},"portuguese":{"name":"Pico Não-Ferroso A","description":""},"italian":{"name":"Picco Non Ferroso A","description":""},"german":{"name":"Non-Ferrous Peak A","description":""},"turkish":{"name":"Non-Ferrous Peak A","description":""}},"children":["HaloPeakXNFe_A"],"@labels":["Channel A","Channel B"]},"HaloPeakRNFe_B":{"@translations":{"english":{"name":"Non-Ferrous Peak B","description":""},"korean":{"name":"비철금속 피크 B","description":""},"spanish":{"name":"Pico No Ferroso B","description":""},"french":{"name":"Limite Supérieure Non-Ferreux B","description":""},"portuguese":{"name":"Pico Não-Ferroso B","description":""},"italian":{"name":"Picco Non Ferroso B","description":""},"german":{"name":"Non-Ferrous Peak B","description":""},"turkish":{"name":"Non-Ferrous Peak B","description":""}},"children":["HaloPeakXNFe_B"],"@labels":["Channel A","Channel B"]},"HaloPeakRSs_A":{"@translations":{"english":{"name":"Stainless Peak A","description":""},"korean":{"name":"스테인리스 피크 A","description":""},"spanish":{"name":"Pico Inoxidable A","description":""},"french":{"name":"Limite Supérieure Acier Inoxydable A","description":""},"portuguese":{"name":"Pico R Aço Inoxidável","description":""},"italian":{"name":"Picco Inossidabile A","description":""},"german":{"name":"Edelstahl Peak A","description":""},"turkish":{"name":"Stainless Peak A","description":""}},"children":["HaloPeakXSs_A"],"@labels":["Channel A","Channel B"]},"HaloPeakRSs_B":{"@translations":{"english":{"name":"Stainless Peak B","description":""},"korean":{"name":"스테인리스 피크 B","description":""},"spanish":{"name":"Pico Inoxidable B","description":""},"french":{"name":"Limite Supérieure Acier inoxidable B","description":""},"portuguese":{"name":"Pico Aço Inoxidável B","description":""},"italian":{"name":"Picco Inossidabile B","description":""},"german":{"name":"Edelstahl Peak B","description":""},"turkish":{"name":"Stainless Peak B","description":""}},"children":["HaloPeakXSs_B"],"@labels":["Channel A","Channel B"]},"PhaseAngle_A":{"@translations":{"english":{"name":"Phase Angle","description":"Current Phase angle the unit is calibrated to "},"korean":{"name":"페이즈","description":""},"spanish":{"name":"Ángulo de Fase","description":""},"french":{"name":"Angle Phase","description":"L’angle de Phase calibrée de l’unité"},"portuguese":{"name":"Ángulo de Fase","description":""},"italian":{"name":"Angolo Fase","description":""},"german":{"name":"Phasenwinkel","description":"aktuell eingestellter/gelernter Phasenwinkel  "},"turkish":{"name":"Phase Angle","description":"Current Phase angle the unit is calibrated to "}},"children":["PhaseAngle_B"],"@labels":["Channel A","Channel B"]},"PhaseMode_A":{"@translations":{"english":{"name":"Phase Mode","description":"Wet or Dry phase mode is set by the calibrated phase angle of the unit"},"korean":{"name":"페이즈 모드","description":""},"spanish":{"name":"Modo Fase","description":""},"french":{"name":"Mode Phase","description":"Mode de Phase Humide ou Sec est réglé par l’angle de phase calibrée de l’unité"},"portuguese":{"name":"Modo da Fase","description":""},"italian":{"name":"Modo Fase","description":""},"german":{"name":"Phasen Modus","description":"Der Modus Nass oder Trocken wird durch den kalibrierten Phasenwinkel des Geräts ermittelt"},"turkish":{"name":"Phase Mode","description":"Wet or Dry phase mode is set by the calibrated phase angle of the unit"}},"children":["PhaseMode_B"],"@labels":["Channel A","Channel B"]},"PhaseSpeed_A":{"@translations":{"english":{"name":"Phase Speed","description":"fixed indicates a fixed value, fast indicates calibration is in progress, auto indicates the detector will automatically phase to small changes in product phase over time, learn indicates a calibration is in progress."},"korean":{"name":"페이즈 학습","description":""},"spanish":{"name":"Velocidad Fase","description":""},"french":{"name":"Vitesse Phase","description":"Fixe indique une valeur fixée, Fast indique une calibration en traitement, Auto indique que le détecteur va automatiquement s’ajuster face aux petites variations de l’effet du produit, Learn indique que la calibration est en traitement."},"portuguese":{"name":"Velocidade da Fase","description":""},"italian":{"name":"Velocità Fase","description":""},"german":{"name":"Phasengeschwindigkeit","description":"fest zeigt einen festen Wert an, schnell zeigt an, dass die Kalibrierung läuft, auto zeigt an, dass der Detektor automatisch zu kleinen Änderungen der Produktphase im Laufe der Zeit nachgeführt wird, lernen zeigt an, dass eine Kalibrierung läuft."},"turkish":{"name":"Phase Speed","description":"fixed indicates a fixed value, fast indicates calibration is in progress, auto indicates the detector will automatically phase to small changes in product phase over time, learn indicates a calibration is in progress."}},"children":["PhaseSpeed_B"],"@labels":["Channel A","Channel B"]},"PhaseModeHold_A":{"@translations":{"english":{"name":"Phase Limit Hold","description":""},"korean":{"name":"페이즈 모드 홀드","description":""},"spanish":{"name":"Retención Límite Fase","description":""},"french":{"name":"Rétention Limite Phase","description":""},"portuguese":{"name":"Trava do Limite da Fase","description":""},"italian":{"name":"Retenzione Limite Fase","description":""},"german":{"name":"Phasen-Grenzen halten","description":""},"turkish":{"name":"Phase Limit Hold","description":""}},"children":["PhaseModeHold_B"],"@labels":["Channel A","Channel B"]},"PhaseLimitDry_A":{"@translations":{"english":{"name":"Dry Phase Limit","description":""},"korean":{"name":"건식 페이즈 극치","description":""},"spanish":{"name":"Límite Fase Seco","description":""},"french":{"name":"Limite Phase Sec","description":""},"portuguese":{"name":"Limite Fase Seco","description":""},"italian":{"name":"Limite Fase Secco","description":""},"german":{"name":"Trocken Phasen-Grenzen","description":""},"turkish":{"name":"Dry Phase Limit","description":""}},"children":["PhaseLimitDry_B"],"@labels":["Channel A","Channel B"]},"PhaseLimitDrySpread_A":{"@translations":{"english":{"name":"Dry Phase Limit Spread","description":""},"korean":{"name":"건식 페이즈 극치 범위","description":""},"spanish":{"name":"Límite Propagación Fase Seco","description":""},"french":{"name":"Limite Vitesse Phase Sec","description":""},"portuguese":{"name":"Limite de Propagação da Fase Seco","description":""},"italian":{"name":"Limite Propagazione Fase Secco","description":""},"german":{"name":"Trocken Phasen-Grenzen setzen","description":""},"turkish":{"name":"Dry Phase Limit Spread","description":""}},"children":["PhaseLimitDrySpread_B"],"@labels":["Channel A","Channel B"]},"PhaseLimitWet_A":{"@translations":{"english":{"name":"Wet Phase Limit","description":""},"korean":{"name":"습식 페이즈","description":""},"spanish":{"name":"Límite Fase Húmedo","description":""},"french":{"name":"Limite Phase Humide","description":""},"portuguese":{"name":"Limite Fase Humido","description":""},"italian":{"name":"Limite Fase Umido","description":""},"german":{"name":"Nass Phasen-Grenzen","description":""},"turkish":{"name":"Wet Phase Limit","description":""}},"children":["PhaseLimitWet_B"],"@labels":["Channel A","Channel B"]},"PhaseLimitWetSpread_A":{"@translations":{"english":{"name":"Wet Phase Limit Spread","description":""},"korean":{"name":"습식 페이즈 극치 범위","description":""},"spanish":{"name":"Límite Propagación Fase Húmedo","description":""},"french":{"name":"Limite Vitesse Phase Humide","description":""},"portuguese":{"name":"Limite de Propagação da Fase Humido ","description":""},"italian":{"name":"Limite Propagazione Fase Umido","description":""},"german":{"name":"Nass Phasen-Grenzen setzen","description":""},"turkish":{"name":"Wet Phase Limit Spread","description":""}},"children":["PhaseLimitWetSpread_B"],"@labels":["Channel A","Channel B"]},"PhaseAngleAuto_A":{"@translations":{"english":{"name":"Phase Angle","description":"Current Phase angle the unit is calibrated to "},"korean":{"name":"페이즈","description":""},"spanish":{"name":"Ángulo Fase","description":""},"french":{"name":"Angle Phase","description":"L’angle de Phase calibrée de l’unité"},"portuguese":{"name":"Ángulo da Fase","description":""},"italian":{"name":"Angolo Fase","description":""},"german":{"name":"Phasenwinkel","description":"aktuell eingestellter/gelernter Phasenwinkel  "},"turkish":{"name":"Phase Angle","description":"Current Phase angle the unit is calibrated to "}},"children":["PhaseAngleAuto_B"],"@labels":["Channel A","Channel B"]},"PhaseFastBit_A":{"@translations":{"english":{"name":"Phase Speed","description":"fixed indicates a fixed value, fast indicates calibration is in progress, auto indicates the detector will automatically phase to small changes in product phase over time, learn indicates a calibration is in progress."},"korean":{"name":"페이즈 속도","description":""},"spanish":{"name":"Velocidad Fase","description":""},"french":{"name":"Vitesse Phase","description":"Fixe indique une valeur fixée, Fast indique une calibration en traitement, Auto indique que le détecteur va automatiquement s’ajuster face aux petites variations de l’effet du produit, Learn indique que la calibration est en traitement."},"portuguese":{"name":"Velocidade da Fase","description":""},"italian":{"name":"Velocità Fase","description":""},"german":{"name":"Phasengeschwindigkeit","description":"fest zeigt einen festen Wert an, schnell zeigt an, dass die Kalibrierung läuft, auto zeigt an, dass der Detektor automatisch zu kleinen Änderungen der Produktphase im Laufe der Zeit nachgeführt wird, lernen zeigt an, dass eine Kalibrierung läuft."},"turkish":{"name":"Phase Speed","description":"fixed indicates a fixed value, fast indicates calibration is in progress, auto indicates the detector will automatically phase to small changes in product phase over time, learn indicates a calibration is in progress."}},"children":["PhaseFastBit_B"],"@labels":["Channel A","Channel B"]},"PhaseWetBit_A":{"@translations":{"english":{"name":"Phase Wet","description":""},"korean":{"name":"습식 페이즈","description":""},"spanish":{"name":"Fase Húmedo","description":""},"french":{"name":"Phase Humide","description":""},"portuguese":{"name":"Fase Humido","description":""},"italian":{"name":"Fase Umido","description":""},"german":{"name":"Phase Wet","description":""},"turkish":{"name":"Phase Wet","description":""}},"children":["PhaseWetBit_B"],"@labels":["Channel A","Channel B"]},"PhaseDSALearn_A":{"@translations":{"english":{"name":"Phase DSA Learn","description":""},"korean":{"name":"DSA 페이즈 학습","description":""},"spanish":{"name":"Aprender Fase DSA","description":""},"french":{"name":"Apprendre Phase DSA ","description":""},"portuguese":{"name":"Aprender Fase DSA","description":""},"italian":{"name":"Apprendere Fase DSA","description":""},"german":{"name":"Phase DSA Learn","description":""},"turkish":{"name":"Phase DSA Learn","description":""}},"children":["PhaseDSALearn_B"],"@labels":["Channel A","Channel B"]},"PhaseTrigLimit":{"@translations":{"english":{"name":"Phase Trigger Limit","description":""},"korean":{"name":"페이즈 트리거 리밋","description":""},"spanish":{"name":"Límite disparo fase","description":""},"french":{"name":"limite déclenchement phase","description":""},"portuguese":{"name":"limite disparo fase","description":""},"italian":{"name":"limite innesco fase","description":""},"german":{"name":"Phase Triggergrenze","description":""},"turkish":{"name":"Phase Trigger Limit","description":""}},"children":[],"@labels":["PhaseTrigLimit"]},"PhaseOffset_A":{"@translations":{"english":{"name":"Phase Offset","description":""},"korean":{"name":"페이즈 오프셋","description":""},"spanish":{"name":"Phase Offset","description":""},"french":{"name":"Phase Offset","description":""},"portuguese":{"name":"Phase Offset","description":""},"italian":{"name":"Phase Offset","description":""},"german":{"name":"Phase Offset","description":""},"turkish":{"name":"Phase Offset","description":""}},"children":["PhaseOffset_B"],"@labels":["Channel A","Channel B"]},"LearnCombined":{"@translations":{"english":{"name":"Learn Combined","description":""},"korean":{"name":"Learn Combined","description":""},"spanish":{"name":"Learn Combined","description":""},"french":{"name":"Learn Combined","description":""},"portuguese":{"name":"Learn Combined","description":""},"italian":{"name":"Learn Combined","description":""},"german":{"name":"Learn Combined","description":""},"turkish":{"name":"Learn Combined","description":""}},"children":[],"@labels":["PhaseTrigLimit"]},"LearnSens_A":{"@translations":{"english":{"name":"Learn Sensitivity","description":""},"korean":{"name":"Learn Sensitivity","description":""},"spanish":{"name":"Learn Sensitivity","description":""},"french":{"name":"Learn Sensitivity","description":""},"portuguese":{"name":"Learn Sensitivity","description":""},"italian":{"name":"Learn Sensitivity","description":""},"german":{"name":"Learn Sensitivity","description":""},"turkish":{"name":"Learn Sensitivity","description":""}},"children":["LearnSens_B"],"@labels":["Channel A","Channel B"]},"ExpectedSig_A":{"@translations":{"english":{"name":"Expected Signal","description":""},"korean":{"name":"Expected Signal","description":""},"spanish":{"name":"Expected Signal","description":""},"french":{"name":"Expected Signal","description":""},"portuguese":{"name":"Expected Signal","description":""},"italian":{"name":"Expected Signal","description":""},"german":{"name":"Expected Signal","description":""},"turkish":{"name":"Expected Signal","description":""}},"children":["ExpectedSig_B"],"@labels":["Channel A","Channel B"]},"SensMax_A":{"@translations":{"english":{"name":"Max Sensitivity","description":""},"korean":{"name":"Max Sensitivity","description":""},"spanish":{"name":"Max Sensitivity","description":""},"french":{"name":"Max Sensitivity","description":""},"portuguese":{"name":"Max Sensitivity","description":""},"italian":{"name":"Max Sensitivity","description":""},"german":{"name":"Max Sensitivity","description":""},"turkish":{"name":"Max Sensitivity","description":""}},"children":["SensMax_B"],"@labels":["Channel A","Channel B"]},"SensMin_A":{"@translations":{"english":{"name":"Min Sensitivity","description":""},"korean":{"name":"Min Sensitivity","description":""},"spanish":{"name":"Min Sensitivity","description":""},"french":{"name":"Min Sensitivity","description":""},"portuguese":{"name":"Max Sensitivity","description":""},"italian":{"name":"Min Sensitivity","description":""},"german":{"name":"Min Sensitivity","description":""},"turkish":{"name":"Min Sensitivity","description":""}},"children":["SensMin_B"],"@labels":["Channel A","Channel B"]},"LearnPhase_A":{"@translations":{"english":{"name":"Learn Phase","description":""},"korean":{"name":"Learn Phase","description":""},"spanish":{"name":"Learn Phase","description":""},"french":{"name":"Learn Phase","description":""},"portuguese":{"name":"Learn Phase","description":""},"italian":{"name":"Learn Phase","description":""},"german":{"name":"Learn Phase","description":""},"turkish":{"name":"Learn Phase","description":""}},"children":["LearnPhase_B"],"@labels":["Channel A","Channel B"]},"RejCheckMode":{"@translations":{"english":{"name":"Reject Check Mode","description":""},"korean":{"name":"거부 확인 모드","description":""},"spanish":{"name":"Reject Check Mode","description":""},"french":{"name":"mode de vérification de rejet ","description":""},"portuguese":{"name":"Reject Check Mode","description":""},"italian":{"name":"Reject Check Mode","description":""},"german":{"name":"Reject Check Mode","description":""},"turkish":{"name":"Reject Check Mode","description":""}},"children":["Rej2Check"],"@labels":["Mode","Device"]},"FaultRejMode":{"@translations":{"english":{"name":"Reject on Fault","description":""},"korean":{"name":"거부시 폴트","description":""},"spanish":{"name":"Reject on Fault","description":""},"french":{"name":"Reject on Fault","description":""},"portuguese":{"name":"Reject on Fault","description":""},"italian":{"name":"Reject on Fault","description":""},"german":{"name":"Reject on Fault","description":""},"turkish":{"name":"Reject on Fault","description":""}},"children":[],"@labels":["Reject Check Mode"]},"Rej2Fault":{"@translations":{"english":{"name":"Alternate Reject on Fault","description":""},"korean":{"name":"거부시 폴트","description":""},"spanish":{"name":"Alternate Reject on Fault","description":""},"french":{"name":"Alternate Reject on Fault","description":""},"portuguese":{"name":"Alternate Reject on Fault","description":""},"italian":{"name":"Alternate Reject on Fault","description":""},"german":{"name":"Alternate Reject on Fault","description":""},"turkish":{"name":"Alternate Reject on Fault","description":""}},"children":[],"@labels":["Reject Check Mode"]},"PhaseTrigThres":{"@translations":{"english":{"name":"Phase Trigger Threshold","description":""},"korean":{"name":"페이즈 트리거 리밋","description":""},"spanish":{"name":"umbral disparo fase","description":""},"french":{"name":"seuil déclenchement phase","description":""},"portuguese":{"name":"limiar disparo fase","description":""},"italian":{"name":"soglia innesco fase","description":""},"german":{"name":"Phasenauslöserschwelle","description":""},"turkish":{"name":"Phase Trigger Threshold","description":""}},"children":[],"@labels":["PhaseTrigLimit"]},"MPhaseOrder_A":{"@translations":{"english":{"name":"M Phase Order","description":""},"korean":{"name":"다중 페이즈 오더","description":""},"spanish":{"name":"Orden Fase M","description":""},"french":{"name":"Commande Phases M","description":""},"portuguese":{"name":"Ordem da Fase M","description":""},"italian":{"name":"Ordine Fasi M","description":""},"german":{"name":"M Phase Ordnung","description":""},"turkish":{"name":"M Phase Order","description":""}},"children":["MPhaseOrder_B"],"@labels":["Channel A","Channel B"]},"MPhaseDD_A":{"@translations":{"english":{"name":"M Phase Detection","description":""},"korean":{"name":"다중 페이즈 감지","description":""},"spanish":{"name":"D Fase M","description":""},"french":{"name":"D Phases M","description":""},"portuguese":{"name":"DD da Fase M","description":""},"italian":{"name":"Rivelamento Fasi M","description":""},"german":{"name":"M Phasen Detektion","description":""},"turkish":{"name":"M Phase Detection","description":""}},"children":["MPhaseDD_B"],"@labels":["Channel A","Channel B"]},"MPhaseRD_A":{"@translations":{"english":{"name":"M Phase Reference","description":""},"korean":{"name":"다중 페이즈 레퍼런스","description":""},"spanish":{"name":"Referencia Fase M","description":""},"french":{"name":"Référence Phases M","description":""},"portuguese":{"name":"RD da Fase M","description":""},"italian":{"name":"Riferimento Fasi M","description":""},"german":{"name":"M Phasen Referenz","description":""},"turkish":{"name":"M Phase Reference","description":""}},"children":["MPhaseRD_A"],"@labels":["Channel A","Channel B"]},"Language":{"@translations":{"english":{"name":"Language","description":"This is a description of f the language"},"korean":{"name":"언어","description":"This is a description of f the language"},"spanish":{"name":"Idioma","description":"Esto es una descripción del idioma"},"french":{"name":"Terminologie","description":"Ceci est une description de la terminologie"},"portuguese":{"name":"Língua","description":"This is a description of f the language"},"italian":{"name":"Lingua","description":""},"german":{"name":"Sprache","description":"Dies ist eine Bezeichnung der Sprache."},"turkish":{"name":"Language","description":"This is a description of f the language"}},"children":[],"@labels":["Language"]},"RejDelSec":{"@translations":{"english":{"name":"Main Reject Delay","description":"Main Reject Delay is the number of seconds from the moment of detection before the main reject device activates"},"korean":{"name":"주 리젝트 딜레이","description":""},"spanish":{"name":"Retardo Rechazo Principal","description":""},"french":{"name":"Délai Rejet Principal","description":"Le Délai de Rejet Principal est nombre de secondes s'étant écoulées depuis la détection jusqu'au moment précédent le déclenchement du Système de Rejet Principal"},"portuguese":{"name":"Atraso Relé Geral","description":""},"italian":{"name":"Ritardo Rifiuto Principale","description":""},"german":{"name":"Auswurf-Verzögerungszeit ","description":"Auswurfverzögerungszeit,hier kann die Zeitverzögerung, ab dem Zeitpunkt der Erkennung eingestellt werden, bevor die Auswurfvorrichtung aktiviert wird."},"turkish":{"name":"Main Reject Delay","description":"Main Reject Delay is the number of seconds from the moment of detection before the main reject device activates"}},"children":[],"@labels":["Main Reject Delay"]},"RejDelSec2":{"@translations":{"english":{"name":"Alternate Reject Delay","description":"Alternae reject delay is the number of seconds from the moment of detection before the alterante reject device activates"},"korean":{"name":"보조 리젝트 딜레이","description":""},"spanish":{"name":"Retardo Rechazo Alternativo","description":""},"french":{"name":"Délai Rejet Alternatif","description":"Le Délai de Rejet Alternatif est nombre de secondes s'étant écoulées depuis la détection jusqu'au moment précédent le déclenchement du Système de Rejet Alternatif"},"portuguese":{"name":"Atraso Relé Alternativo","description":""},"italian":{"name":"Ritardo Rifiuto Alternativo","description":""},"german":{"name":"Alt. Auswurf-Verzögerungszeit","description":"Alt.Auswurfverzögerungszeit,hier kann die Zeitverzögerung, ab dem Zeitpunkt der Erkennung eingestellt werden, bevor die Auswurfvorrichtung aktiviert wird."},"turkish":{"name":"Alternate Reject Delay","description":"Alternae reject delay is the number of seconds from the moment of detection before the alterante reject device activates"}},"children":[],"@labels":["Alternate Reject Delay"]},"RejDurSec":{"@translations":{"english":{"name":"Main Reject Duration","description":"Main Reject Duration is the number of seconds for which the main reject device will be activated"},"korean":{"name":"주 리젝트 유지시간","description":""},"spanish":{"name":"Duración Rechazo Principal","description":""},"french":{"name":"Durée Rejet Principal","description":"La Durée du rejet est le nombre de secondes que demeurera activé le Système de Rejet Principal"},"portuguese":{"name":"Duração Relé Geral","description":""},"italian":{"name":"Durata Rifiuto Principale","description":""},"german":{"name":"Auswurf-Dauer","description":"Auswurf-Dauer,hier kann die Zeitdauer eingestellt werden für die, die Auswurfvorrichtung betätigt werden soll."},"turkish":{"name":"Main Reject Duration","description":"Main Reject Duration is the number of seconds for which the main reject device will be activated"}},"children":[],"@labels":["Main Reject Duration"]},"RejDurSec2":{"@translations":{"english":{"name":"Alternate Reject Duration","description":"Alternate Reject Duration is the number of seconds for which the alternate reject device will be activated"},"korean":{"name":"보조 리젝트 유지시간","description":""},"spanish":{"name":"Duración Rechazo Alternativo","description":""},"french":{"name":"Durée Rejet Alternatif","description":"La Durée du Rejet Alternatif est le nombre de secondes que demeurera activé le Système de Rejet Alternatif"},"portuguese":{"name":"Duração Relé Alternativo","description":""},"italian":{"name":"Durata Rifiuto Alternativa","description":""},"german":{"name":"Alt.Auswurf-Dauer","description":"Alt.Auswurf-Dauer,hier kann die Zeitdauer eingestellt werden für die, die Auswurfvorrichtung betätigt werden soll."},"turkish":{"name":"Alternate Reject Duration","description":"Alternate Reject Duration is the number of seconds for which the alternate reject device will be activated"}},"children":[],"@labels":["Alternate Reject Duration"]},"RejMode":{"@translations":{"english":{"name":"Reject Mode","description":"Set to normal for operation without an infeed photo eye, photo for operation with an infeed photo eye, and reverse for reverse operations"},"korean":{"name":"리젝트 모드","description":""},"spanish":{"name":"Modo Rechazo","description":""},"french":{"name":"Mode Rejet","description":"Réglé en position normale pour une installation sans capteur optique, réglez à photo pour une installation avec un capteur optique et marche arrière pour une opération de marche arrière"},"portuguese":{"name":"Modo de Rejeção","description":""},"italian":{"name":"Modo Rifuto","description":""},"german":{"name":"Auswurf Modus","description":"Für den Betrieb ohne Lichtschranke, Foto für den Betrieb mit eine Lichtschranke, und invers für die Erkennung/Ausschleußung nicht metallhaltiger Produkte."},"turkish":{"name":"Reject Mode","description":"Set to normal for operation without an infeed photo eye, photo for operation with an infeed photo eye, and reverse for reverse operations"}},"children":[],"@labels":["Reject Mode"]},"RejExitDist":{"@translations":{"english":{"name":"Reject Exit Distance","description":"Distance from the center of the head to the exit photo eye"},"korean":{"name":"리젝트 퇴장 거리","description":""},"spanish":{"name":"Distancia Salida Rechazo","description":""},"french":{"name":"Distance Sortie Rejet","description":"Distance du centre de la tête à la sortie du capteur optique"},"portuguese":{"name":"Distancia da Saida de Rejeção","description":""},"italian":{"name":"Distanza Uscita Rifuto","description":""},"german":{"name":"Abstand Ausgangslichtschranke","description":"Abstand von der Mitte des Suchkopfes bis zur Ausgangslichtschranke"},"turkish":{"name":"Reject Exit Distance","description":"Distance from the center of the head to the exit photo eye"}},"children":[],"@labels":["Reject Exit Distance"]},"RejExitDistEst":{"@translations":{"english":{"name":"Reject Exit Distance Estimate","description":"Distance from the center of the head to the exit photo eye"},"korean":{"name":"리젝트 퇴장 거리 추정","description":""},"spanish":{"name":"Reject Exit Distance Estimate","description":""},"french":{"name":"Reject Exit Distance Estimate","description":"Distance du centre de la tête à la sortie du capteur optique"},"portuguese":{"name":"Reject Exit Distance Estimate","description":""},"italian":{"name":"Reject Exit Distance Estimate","description":""},"german":{"name":"Reject Exit Distance Estimate","description":"Abstand von der Mitte des Suchkopfes bis zur Ausgangslichtschranke"},"turkish":{"name":"Reject Exit Distance Estimate","description":"Distance from the center of the head to the exit photo eye"}},"children":[],"@labels":["Reject Exit Distance"]},"RejExitWin":{"@translations":{"english":{"name":"Reject Exit Window","description":"tolerance window is available to compensate for cases where the pack may slip or turn in normal production causing unnecessary faults; can be increased where required to eliminate excess faults due to pack movement errors."},"korean":{"name":"리젝트 퇴장 범위","description":""},"spanish":{"name":"Ventana Salida Rechazo","description":""},"french":{"name":"Fenêtre Sortie Rejet","description":"Une fenêtre de tolérance est disponible pour les situations où le paquet peut glisser ou tourner sur une ligne de production normale créant ainsi des défaillances; elle peut être augmentée s’il est requis d’éliminer un excès de défaillances en lien avec le mouvement erroné d’un paquet."},"portuguese":{"name":"Janela da Saida de Rejeção","description":""},"italian":{"name":"Finestra Uscita Rifuto","description":""},"german":{"name":"Toleranz Ausgangslichtschranke","description":"Toleranzfenster ist verfügbar, um Fälle auszugleichen, in denen die Packung bei normaler Produktion rutschen oder wenden kann, was unnötige Fehler verursacht; kann bei Bedarf erhöht werden, um übermäßige Fehler aufgrund von Packungsbewegungsfehlern zu eliminieren."},"turkish":{"name":"Reject Exit Window","description":"tolerance window is available to compensate for cases where the pack may slip or turn in normal production causing unnecessary faults; can be increased where required to eliminate excess faults due to pack movement errors."}},"children":[],"@labels":["Reject Exit Window"]},"AppUnitDist":{"@translations":{"english":{"name":"Units ","description":""},"korean":{"name":"단위 ","description":""},"spanish":{"name":"Unidades ","description":""},"french":{"name":"Unité","description":""},"portuguese":{"name":"Unidades","description":""},"italian":{"name":"Unità","description":""},"german":{"name":"Einheiten ","description":""},"turkish":{"name":"Units ","description":""}},"children":[],"@labels":["Units "]},"BeltSpeed":{"@translations":{"english":{"name":"Belt Speed","description":"Speed of product through the detector; should be set even for non conveyor applications"},"korean":{"name":"벨트 속도","description":""},"spanish":{"name":"Velocidad Cinta","description":""},"french":{"name":"Vitesse Courroie","description":"Vitesse du produit circulant dans le détecteur; elle devrait être réglée même sur des applications sans convoyeur"},"portuguese":{"name":"Velocidade da Esteira","description":""},"italian":{"name":"Velocità Nastro Trasportatore","description":""},"german":{"name":"Bandgeschwindigkeit","description":"Geschwindigkeit des Produkts durch den Detektor; sollte für Anwendungen ohne Förderer manuell eingestellt werden."},"turkish":{"name":"Belt Speed","description":"Speed of product through the detector; should be set even for non conveyor applications"}},"children":[],"@labels":["Belt Speed"]},"BeltSpeedEst":{"@translations":{"english":{"name":"Belt Speed Estimate","description":"Estimated belt speed based on photo eye and package length when running a sample pack."},"korean":{"name":"벨트 속도 추정치","description":""},"spanish":{"name":"Velocidad Cinta Estimate","description":""},"french":{"name":"Vitesse Estimée Courroie","description":"Vitesse Estimée de Courroie basée sur le capteur optique et la longueur du paquet lors du passage de l’échantillon"},"portuguese":{"name":"Velocidade da Esteira Estimate","description":""},"italian":{"name":"Velocità Nastro Trasportatore Est.","description":""},"german":{"name":"Ermittlung der Bandgeschwindigkeit","description":"Ermittelte Bandgeschwindigkeit mit Hilfe der Einlauflichtschranke und der Paketlänge beim Durchlauf eines Probepacks."},"turkish":{"name":"Belt Speed Estimate","description":"Estimated belt speed based on photo eye and package length when running a sample pack."}},"children":[],"@labels":["Belt Speed"]},"FaultLatch":{"@translations":{"english":{"name":"Fault Latch","description":""},"korean":{"name":"폴트 래치","description":""},"spanish":{"name":"Retención Fallo","description":""},"french":{"name":"Défaillance du Verrou","description":""},"portuguese":{"name":"Trava Falha","description":""},"italian":{"name":"Mantenere Messaggio Errore","description":""},"german":{"name":"Fehlerverriegelung","description":""},"turkish":{"name":"Fault Latch","description":""}},"children":[],"@labels":["Fault Latch"]},"RejLatchMode":{"@translations":{"english":{"name":"Reject Latch","description":""},"korean":{"name":"리젝트 래치","description":""},"spanish":{"name":"Retención Rechazo","description":""},"french":{"name":"Verrou Rejet","description":""},"portuguese":{"name":"Trava Rejeção","description":""},"italian":{"name":"Mantenere Rifiuto","description":""},"german":{"name":"Auswurfselbsthaltung","description":""},"turkish":{"name":"Reject Latch","description":""}},"children":[],"@labels":["Reject Latch"]},"Rej2Latch":{"@translations":{"english":{"name":"Alternate Reject Latch","description":""},"korean":{"name":"보조 리젝트 래치","description":""},"spanish":{"name":"Retención Rechazo Alternativo","description":""},"french":{"name":"Verrou Alternatif Rejet","description":""},"portuguese":{"name":"Trava Rejeção Alternativa","description":""},"italian":{"name":"Mantenere Rifiuto Alternativo","description":""},"german":{"name":"Alternative Auswurfselbsthaltung","description":""},"turkish":{"name":"Alternate Reject Latch","description":""}},"children":[],"@labels":["Alternate Reject Latch"]},"ManRejState":{"@translations":{"english":{"name":"Manual Reject","description":""},"korean":{"name":"수동 리젝트","description":""},"spanish":{"name":"Manual Reject","description":""},"french":{"name":"Manual Reject","description":""},"portuguese":{"name":"Manual Reject","description":""},"italian":{"name":"Manual Reject","description":""},"german":{"name":"Manual Reject","description":""},"turkish":{"name":"Manual Reject","description":""}},"children":[],"@labels":["Alternate Reject Latch"]},"EyeReject":{"@translations":{"english":{"name":"Photo Reject","description":"The “mid” option of Photo Reject means that the reject device will hit the middle of the package regardless of the package size (kicker rejects) – it can be changed to “lead” (leading edge for diverter rejects) or “width” (entire length of package for retracting rejects)"},"korean":{"name":"포토 리젝트","description":""},"spanish":{"name":"Eye Reject","description":""},"french":{"name":"Rejet Capteur Optique","description":"L'option \"Mid\" du Capteur Optique détermine que le dispositif de rejet frappera le milieu du paquet peu importe la grosseur de celui-ci ( Pousseur/Piston)— elle peut être modifiée to \"Lead\" ( la partie avant pour le bras déviateur) ou \"Width\" (toute la largeur du produit pour une courroie de rappel)"},"portuguese":{"name":"Eye Reject","description":""},"italian":{"name":"Eye Reject","description":""},"german":{"name":"Lichtschrankenauswurf ","description":"Die \"Mitte\" Option von Lichtschrankenauswurf bedeutet, dass die Auswurfvorrichtung unabhängig von der Packungsgröße (Kicker/Pusher-Auswurf) die Mitte des Produktes trifft - es kann zwischen \"Vorderkante\" (Vorderkante bei Abweisarmen) oder \"Länge\" ( Gesamtlänge des Produktes bei Rückzug der Endwalze umgestellt werden."},"turkish":{"name":"Photo Reject","description":"The “mid” option of Photo Reject means that the reject device will hit the middle of the package regardless of the package size (kicker rejects) – it can be changed to “lead” (leading edge for diverter rejects) or “width” (entire length of package for retracting rejects)"}},"children":[],"@labels":["Eye Reject"]},"RejBinDoorTime":{"@translations":{"english":{"name":"Reject Bin Door Time","description":"The time allowed in seconds for the bin door to remain open"},"korean":{"name":"리젝트 보관함 오픈시간","description":""},"spanish":{"name":"Tiempo Puerta Contenedor","description":""},"french":{"name":"Délai Ouverture Porte Boîte Rejet","description":"La durée en secondes de l’ouverture de la porte de la boîte de rejet"},"portuguese":{"name":"Tempo Falha Porta Caixa de rejeção","description":""},"italian":{"name":"Tempo Porta Contenitore","description":""},"german":{"name":"Zeit Auswurfbehältertüre","description":"Die Zeit, in Sekunden welche die Auswurfbehältertür geöffnet sein darf."},"turkish":{"name":"Reject Bin Door Time","description":"The time allowed in seconds for the bin door to remain open"}},"children":[],"@labels":["Reject Bin Door Time"]},"AutoPhasePacks":{"@translations":{"english":{"name":"Auto Phase Packs","description":""},"korean":{"name":"오토페이즈 팩 갯수","description":""},"spanish":{"name":"Auto Phase Packs","description":""},"french":{"name":"Auto Phase Packs","description":""},"portuguese":{"name":"Auto Phase Packs","description":""},"italian":{"name":"Auto Phase Packs","description":""},"german":{"name":"Auto Phase Packs","description":""},"turkish":{"name":"Auto Phase Packs","description":""}},"children":[],"@labels":["Reject Bin Door Time"]},"CIPCycleTime":{"@translations":{"english":{"name":"CIP Cycle Time","description":"The duration of a CIP cycle"},"korean":{"name":"CIP 사이클 시간","description":""},"spanish":{"name":"Tiempo Ciclo Limpieza","description":""},"french":{"name":"Temp Cycle CIP","description":"La durée de temps d'un cycle CIP"},"portuguese":{"name":"Tempo Ciclo Limpeza CIP","description":""},"italian":{"name":"Tempo Ciclo Pulizia CIP","description":""},"german":{"name":"CIP Zykluszeit","description":"Die Zeitdauer eines CIP-Zyklus."},"turkish":{"name":"CIP Cycle Time","description":"The duration of a CIP cycle"}},"children":[],"@labels":["CIP Cycle Time"]},"CIPDwellTime":{"@translations":{"english":{"name":"CIP Dwell Time","description":"The duration during one CIP cycle that the reject will be active (in reject position)"},"korean":{"name":"CIP 유지 시간","description":""},"spanish":{"name":"Tiempo Actuación CIP","description":""},"french":{"name":"CIP Dwell Time","description":"La durée de temps, pendant un cycle CIP, de l’activation du système de rejet (en position de rejet)"},"portuguese":{"name":"Tempo de Atuação CIP","description":""},"italian":{"name":"Tempo Azionamento CIP","description":""},"german":{"name":"CIP Verweilzeit","description":"Die Dauer während eines CIP-Zyklus, in dem der Auswurfvorrichtung aktiv ist.\n (in der Auswurfposition)"},"turkish":{"name":"CIP Dwell Time","description":"The duration during one CIP cycle that the reject will be active (in reject position)"}},"children":[],"@labels":["CIP Dwell Time"]},"FaultClearTime":{"@translations":{"english":{"name":"Fault Clear Time","description":""},"korean":{"name":"폴트 클리어 시간","description":""},"spanish":{"name":"Tiempo Borrado Fallo","description":""},"french":{"name":"Temps sans Défaillance/Erreur","description":""},"portuguese":{"name":"Tempo Limpar Falhas","description":""},"italian":{"name":"Tempo Cancellazione Errore","description":""},"german":{"name":"Fehler-Lösch-Zeit","description":""},"turkish":{"name":"Fault Clear Time","description":""}},"children":[],"@labels":["Fault Clear Time"]},"EyeBlockTime":{"@translations":{"english":{"name":"Eye Block Time","description":""},"korean":{"name":"아이 차단 시간","description":""},"spanish":{"name":"Tiempo Bloqueo Fotocélula","description":""},"french":{"name":"Temps Capteur Optique Obstrué","description":""},"portuguese":{"name":"Tempo Fotocélula Bloqueado","description":""},"italian":{"name":"Tempo Blocco Fotocellula","description":""},"german":{"name":"Blockierzeit Lichtschranke","description":""},"turkish":{"name":"Eye Block Time","description":""}},"children":[],"@labels":["Eye Block Time"]},"RejCheckTime":{"@translations":{"english":{"name":"Reject Check Time","description":""},"korean":{"name":"리젝트 확인 시간","description":""},"spanish":{"name":"Tiempo Comprobación Rechazo","description":""},"french":{"name":"Temps Confirmation Rejet","description":""},"portuguese":{"name":"Tempo Confirmação de Rejeção","description":""},"italian":{"name":"Tempo Verifica Rifiuto","description":""},"german":{"name":"Zeit Auswurfbestätigung","description":""},"turkish":{"name":"Reject Check Time","description":""}},"children":[],"@labels":["Reject Check Time"]},"ExcessRejTime":{"@translations":{"english":{"name":"Excess Reject Time","description":""},"korean":{"name":"초과 리젝트 시간","description":""},"spanish":{"name":"Tiempo Rechazo Excedente","description":""},"french":{"name":"Dépassement Temps Rejet","description":""},"portuguese":{"name":"Tempo de Rejeção Ultrapassado","description":""},"italian":{"name":"Tempo Rifiuto Eccedente","description":""},"german":{"name":"Exzessive Auswurfzeit","description":""},"turkish":{"name":"Excess Reject Time","description":""}},"children":[],"@labels":["Excess Reject Time"]},"RejDelClock":{"@translations":{"english":{"name":"Reject Clock","description":""},"korean":{"name":"리젝트 시간","description":""},"spanish":{"name":"Retardo Rechazo","description":""},"french":{"name":"Minuterie Délais Rejet","description":""},"portuguese":{"name":"Relógio Atrazo de Rejeção","description":""},"italian":{"name":"Ritardo Rifiuto","description":""},"german":{"name":"Auswurf Zeitgeber","description":""},"turkish":{"name":"Reject Clock","description":""}},"children":[],"@labels":["Reject Delay Clock"]},"EncFreq":{"@translations":{"english":{"name":"Encoder Frequency","description":""},"korean":{"name":"엔코더 주파수","description":""},"spanish":{"name":"Encoder Frequency","description":""},"french":{"name":"Encoder Frequency","description":""},"portuguese":{"name":"Encoder Frequency","description":""},"italian":{"name":"Encoder Frequency","description":""},"german":{"name":"Encoder Frequency","description":""},"turkish":{"name":"Encoder Frequency","description":""}},"children":[],"@labels":["Reject Delay Clock"]},"HaloBoard":{"@translations":{"english":{"name":"Halo Board","description":""},"korean":{"name":"헤일로 보드","description":""},"spanish":{"name":"Halo Board","description":""},"french":{"name":"Halo Board","description":""},"portuguese":{"name":"Halo Board","description":""},"italian":{"name":"Halo Board","description":""},"german":{"name":"Halo Board","description":""},"turkish":{"name":"Halo Board","description":""}},"children":[],"@labels":["Reject Delay Clock"]},"HaloCal":{"@translations":{"english":{"name":"Halo Calibration","description":""},"korean":{"name":"Halo Calibration","description":""},"spanish":{"name":"Halo Calibration","description":""},"french":{"name":"Halo Calibration","description":""},"portuguese":{"name":"Halo Calibration","description":""},"italian":{"name":"Halo Calibration","description":""},"german":{"name":"Halo Calibration","description":""},"turkish":{"name":"Halo Calibration","description":""}},"children":[],"@labels":["Reject Delay Clock"]},"PW1":{"@translations":{"english":{"name":"Password 1","description":""},"korean":{"name":"암호 1","description":""},"spanish":{"name":"Contraseña 1","description":""},"french":{"name":"Mot de Passe 1","description":""},"portuguese":{"name":"Senha 1","description":""},"italian":{"name":"Password 1","description":""},"german":{"name":"Passwort 1","description":""},"turkish":{"name":"Password 1","description":""}},"children":[],"@labels":["Password 1"]},"PW2":{"@translations":{"english":{"name":"Password 2","description":""},"korean":{"name":"암호 2","description":""},"spanish":{"name":"Contraseña 2","description":""},"french":{"name":"Mot de Passe 2","description":""},"portuguese":{"name":"Senha 2","description":""},"italian":{"name":"Password 2","description":""},"german":{"name":"Passwort 2","description":""},"turkish":{"name":"Password 2","description":""}},"children":[],"@labels":["Password 2"]},"PW3":{"@translations":{"english":{"name":"Password 3","description":""},"korean":{"name":"암호 3","description":""},"spanish":{"name":"Contraseña 3","description":""},"french":{"name":"Mot de Passe 3","description":""},"portuguese":{"name":"Senha 3","description":""},"italian":{"name":"Password 3","description":""},"german":{"name":"Passwort 3","description":""},"turkish":{"name":"Password 3","description":""}},"children":[],"@labels":["Password 3"]},"PW4":{"@translations":{"english":{"name":"Password 4","description":""},"korean":{"name":"암호 4","description":""},"spanish":{"name":"Contraseña 4","description":""},"french":{"name":"Mot de Passe 4","description":""},"portuguese":{"name":"Senha 4","description":""},"italian":{"name":"Password 4","description":""},"german":{"name":"Passwort 4","description":""},"turkish":{"name":"Password 4","description":""}},"children":[],"@labels":["Password 4"]},"PassAccSens":{"@translations":{"english":{"name":"Sensitivity Access Level","description":""},"korean":{"name":"민감도 접근 레벨","description":""},"spanish":{"name":"Nivel Acesso Sensibilidad","description":""},"french":{"name":"Niveau d'Accès Sensibilité","description":""},"portuguese":{"name":"Nível de Acesso à Sensibilidade ","description":""},"italian":{"name":"Livello Accesso Sensibilità","description":""},"german":{"name":"Empfindlichkeit Zugriffsebene","description":""},"turkish":{"name":"Sensitivity Access Level","description":""}},"children":[],"@labels":["Sensitivity Access Level"]},"PassAccProd":{"@translations":{"english":{"name":"Product Access Level","description":""},"korean":{"name":"품목 접근 레벨","description":""},"spanish":{"name":"Nivel Acceso Producto","description":""},"french":{"name":"Niveau D'Accès Produit","description":""},"portuguese":{"name":"Nível de Acesso ao Produto","description":""},"italian":{"name":"Livello Accesso Prodotto","description":""},"german":{"name":"Produkt Zugriffsebene","description":""},"turkish":{"name":"Product Access Level","description":""}},"children":[],"@labels":["Product Access Level"]},"PassAccCal":{"@translations":{"english":{"name":"Calibrate Access Level","description":""},"korean":{"name":"캘리브레이션 접근 레벨","description":""},"spanish":{"name":"Nivel Acceso Calibración","description":""},"french":{"name":"Niveau d'Accès Calibration","description":""},"portuguese":{"name":"Nível de Acesso à Calibração","description":""},"italian":{"name":"Livello Accesso Calibrazione","description":""},"german":{"name":"Kalibrieren Zugriffsebene","description":""},"turkish":{"name":"Calibrate Access Level","description":""}},"children":[],"@labels":["Calibrate Access Level"]},"PassAccTest":{"@translations":{"english":{"name":"Test Access Level","description":""},"korean":{"name":"테스트 접근 레벨","description":""},"spanish":{"name":"Nivel Acceso Test","description":""},"french":{"name":"Niveau d'Accès Test","description":""},"portuguese":{"name":"Nível de Accesso à Teste","description":""},"italian":{"name":"Livello Accesso Test","description":""},"german":{"name":"Test Zugriffsebene","description":""},"turkish":{"name":"Test Access Level","description":""}},"children":[],"@labels":["Test Access Level"]},"PassAccSelUnit":{"@translations":{"english":{"name":"Select Unit Access Level","description":""},"korean":{"name":"유닛선택 접근 레벨","description":""},"spanish":{"name":"Nivel Acceso Unidad","description":""},"french":{"name":"Sélectionnez Niveau Accès Unité","description":""},"portuguese":{"name":"Nível de Acesso das Unidades","description":""},"italian":{"name":"Livello Accesso Unità","description":""},"german":{"name":"Gerätewahl Zugriffsebene","description":""},"turkish":{"name":"Select Unit Access Level","description":""}},"children":[],"@labels":["Select Unit Access Level"]},"PassAccClrFaults":{"@translations":{"english":{"name":"Fault Clear Access Level","description":""},"korean":{"name":"폴트클리어 접근 레벨","description":""},"spanish":{"name":"Nivel Acceso Borrado Fallo","description":""},"french":{"name":"Défaillance/Erreur Effacer Niveau Accès","description":""},"portuguese":{"name":"Nível de Acesso à Limpar Falha","description":""},"italian":{"name":"Livello Accesso Cancellazione Errore","description":""},"german":{"name":"Fehler löschen Zugriffsebene","description":""},"turkish":{"name":"Fault Clear Access Level","description":""}},"children":[],"@labels":["Fault Clear Access Level"]},"PassAccClrRej":{"@translations":{"english":{"name":"Reject Clear Access Level","description":""},"korean":{"name":"리젝트클리어 접근 레벨","description":""},"spanish":{"name":"Nivel Acceso Borrado Rechazo","description":""},"french":{"name":"Reject Effacer Niveau Accès","description":""},"portuguese":{"name":"Nível de Acesso à Rejeção","description":""},"italian":{"name":"Livello Accesso Cancellazione Rifiuto","description":""},"german":{"name":"Auswurf löschen Zugriffsebene","description":""},"turkish":{"name":"Reject Clear Access Level","description":""}},"children":[],"@labels":["Reject Clear Access Level"]},"PassAccClrLatch":{"@translations":{"english":{"name":"Latch Clear Access Level","description":""},"korean":{"name":"래치클리어 접근 레벨","description":""},"spanish":{"name":"Nivel Acceso Borrado Retención","description":""},"french":{"name":"Verrou Effacer Niveau Accès","description":""},"portuguese":{"name":"Nível de Acesso à Reset Trava","description":""},"italian":{"name":"Livello Accesso Cancellazione Mantenere Messaggi","description":""},"german":{"name":"Selbsthaltung  Zugriffsebene","description":""},"turkish":{"name":"Latch Clear Access Level","description":""}},"children":[],"@labels":["Latch Clear Access Level"]},"PassAccTime":{"@translations":{"english":{"name":"Time Access Level","description":""},"korean":{"name":"시간 접근 레벨","description":""},"spanish":{"name":"Nivel Acceso Hora","description":""},"french":{"name":"Temps Niveau Accès","description":""},"portuguese":{"name":"Nível de Acesso Tempo","description":""},"italian":{"name":"Livello Accesso Ora","description":""},"german":{"name":"Zeit Zugriffsebene","description":""},"turkish":{"name":"Time Access Level","description":""}},"children":[],"@labels":["Time Access Level"]},"PassAccSync":{"@translations":{"english":{"name":"Sync Access Level","description":""},"korean":{"name":"동기화 접근 레벨","description":""},"spanish":{"name":"Nivel Acceso Sync","description":""},"french":{"name":"Sync Niveau Accès","description":""},"portuguese":{"name":"Nível de Acesso Sync","description":""},"italian":{"name":"Livello Accesso Sync","description":""},"german":{"name":"Synchronisation Zugriffsebene","description":""},"turkish":{"name":"Sync Access Level","description":""}},"children":[],"@labels":["Sync Access Level"]},"DateTime":{"@translations":{"english":{"name":"Detector Time","description":""},"korean":{"name":"디텍터 시간","description":""},"spanish":{"name":"Detector Time","description":""},"french":{"name":"Detector Time","description":""},"portuguese":{"name":"Detector Time","description":""},"italian":{"name":"Detector Time","description":""},"german":{"name":"Detector Time","description":""},"turkish":{"name":"Detector Time","description":""}},"children":[],"@labels":["Sync Access Level"]},"INPUT_TACH":{"@translations":{"english":{"name":"Tachometer","description":""},"korean":{"name":"타코미터","description":""},"spanish":{"name":"Tacómetro","description":""},"french":{"name":"Tachymètre","description":""},"portuguese":{"name":"Tacômetro","description":""},"italian":{"name":"Tachimetro","description":""},"german":{"name":"Impulsgeber","description":""},"turkish":{"name":"Tachometer","description":""}},"children":["INPUT_POL_TACH"],"@labels":["Source","Polarity"]},"INPUT_EYE":{"@translations":{"english":{"name":"Photo Eye","description":""},"korean":{"name":"포토아이","description":""},"spanish":{"name":"Fotocélula","description":""},"french":{"name":"Capteur Optique","description":""},"portuguese":{"name":"Fotocélula","description":""},"italian":{"name":"Fotocellula","description":""},"german":{"name":"Lichtschranke","description":""},"turkish":{"name":"Photo Eye","description":""}},"children":["INPUT_POL_EYE"],"@labels":["Source","Polarity"]},"INPUT_RC_1":{"@translations":{"english":{"name":"Reject Check 1","description":""},"korean":{"name":"리젝트 체크 1","description":""},"spanish":{"name":"Comprobación Rechazo 1","description":""},"french":{"name":"Confirmation Rejet 1","description":""},"portuguese":{"name":"Confirmação Rejeççao 1","description":""},"italian":{"name":"Verifica Rifiuto 1","description":""},"german":{"name":"Auswurfbestätigung 1","description":""},"turkish":{"name":"Reject Check 1","description":""}},"children":["INPUT_POL_RC_1"],"@labels":["Source","Polarity"]},"INPUT_RC_2":{"@translations":{"english":{"name":"Reject Check 2","description":""},"korean":{"name":"리젝트 체크 2","description":""},"spanish":{"name":"Comprobación Rechazo 2","description":""},"french":{"name":"Confirmation Rejet 2","description":""},"portuguese":{"name":"Comfirmação Rejeção 2","description":""},"italian":{"name":"Verifica Rifiuto 2","description":""},"german":{"name":"Auswurfbestätigung 2","description":""},"turkish":{"name":"Reject Check 2","description":""}},"children":["INPUT_POL_RC_2"],"@labels":["Source","Polarity"]},"INPUT_REJ_EYE":{"@translations":{"english":{"name":"Reject Eye","description":""},"korean":{"name":"리젝트 아이","description":""},"spanish":{"name":"Fotocélula de Rechazo","description":""},"french":{"name":"Capteur Optique Rejet","description":""},"portuguese":{"name":"Fotocélula de Rejeção","description":""},"italian":{"name":"Fotocellula di Rifiuto","description":""},"german":{"name":"Einlauflichtschranke","description":""},"turkish":{"name":"Reject Eye","description":""}},"children":["INPUT_POL_REJ_EYE"],"@labels":["Source","Polarity"]},"INPUT_AIR_PRES":{"@translations":{"english":{"name":"Air Pressure","description":""},"korean":{"name":"공기압","description":""},"spanish":{"name":"Presión Aire","description":""},"french":{"name":"Pression d'Air","description":""},"portuguese":{"name":"Pressão do Ar","description":""},"italian":{"name":"Pressione Aria","description":""},"german":{"name":"Druckluft","description":""},"turkish":{"name":"Air Pressure","description":""}},"children":["INPUT_POL_AIR_PRES"],"@labels":["Source","Polarity"]},"INPUT_REJ_LATCH":{"@translations":{"english":{"name":"Reject Latch","description":""},"korean":{"name":"리젝트 래치","description":""},"spanish":{"name":"Retención Rechazo","description":""},"french":{"name":"Verrou Rejet","description":""},"portuguese":{"name":"Trava da Rejeção","description":""},"italian":{"name":"Mantenere Rifiuto","description":""},"german":{"name":"Auswurf Selbsthaltung","description":""},"turkish":{"name":"Reject Latch","description":""}},"children":["INPUT_POL_REJ_LATCH"],"@labels":["Source","Polarity"]},"INPUT_BIN_FULL":{"@translations":{"english":{"name":"Bin Full","description":""},"korean":{"name":"보관함 용량초과","description":""},"spanish":{"name":"Contenedor Lleno","description":""},"french":{"name":"Boîte Pleine","description":""},"portuguese":{"name":"Caixa Cheia","description":""},"italian":{"name":"Contenitore Pieno","description":""},"german":{"name":"Auswurfbehälter voll","description":""},"turkish":{"name":"Bin Full","description":""}},"children":["INPUT_POL_BIN_FULL"],"@labels":["Source","Polarity"]},"INPUT_REJ_PRESENT":{"@translations":{"english":{"name":"Reject Present","description":""},"korean":{"name":"리젝트 유효","description":""},"spanish":{"name":"Rechazo Presente","description":""},"french":{"name":"Présence Rejet","description":""},"portuguese":{"name":"Rejeção Presente","description":""},"italian":{"name":"Rifiuto Presente","description":""},"german":{"name":"Auswurf vorhanden","description":""},"turkish":{"name":"Reject Present","description":""}},"children":["INPUT_POL_REJ_PRESENT"],"@labels":["Source","Polarity"]},"INPUT_DOOR1_OPEN":{"@translations":{"english":{"name":"Door 1 Open","description":""},"korean":{"name":"문 1 열림","description":""},"spanish":{"name":"Puerta 1 Abierta","description":""},"french":{"name":"Porte 1 Ouverte","description":""},"portuguese":{"name":"Porta 1 Aberta","description":""},"italian":{"name":"Porta 1 Aperta","description":""},"german":{"name":"Türe 1 offen","description":""},"turkish":{"name":"Door 1 Open","description":""}},"children":["INPUT_POL_DOOR1_OPEN"],"@labels":["Source","Polarity"]},"INPUT_DOOR2_OPEN":{"@translations":{"english":{"name":"Door 2 Open","description":""},"korean":{"name":"문 2 열림","description":""},"spanish":{"name":"Puerta 2 Abierta","description":""},"french":{"name":"Porte 2 Ouverte","description":""},"portuguese":{"name":"Porta 2 Aberta","description":""},"italian":{"name":"Porta 2 Aperta","description":""},"german":{"name":"Türe 2 offen","description":""},"turkish":{"name":"Door 2 Open","description":""}},"children":["INPUT_POL_DOOR2_OPEN"],"@labels":["Source","Polarity"]},"INPUT_CLEAR_FAULTS":{"@translations":{"english":{"name":"Clear Faults","description":""},"korean":{"name":"폴트 클리어","description":""},"spanish":{"name":"Borrar Fallos","description":""},"french":{"name":"Effacer Erreur","description":""},"portuguese":{"name":"Limpar Falhas","description":""},"italian":{"name":"Cancella Errori","description":""},"german":{"name":"Fehler löschen","description":""},"turkish":{"name":"Clear Faults","description":""}},"children":["INPUT_POL_CLEAR_FAULTS"],"@labels":["Source","Polarity"]},"INPUT_CLEAR_WARNINGS":{"@translations":{"english":{"name":"Clear Warnings","description":""},"korean":{"name":"경고 클리어","description":""},"spanish":{"name":"Borrar Advertencias","description":""},"french":{"name":"Effacer Alerte","description":""},"portuguese":{"name":"Limpar Avisos","description":""},"italian":{"name":"Cancella Avvertenze","description":""},"german":{"name":"Fehler Warnungen","description":""},"turkish":{"name":"Clear Warnings","description":""}},"children":["INPUT_POL_CLEAR_WARNINGS"],"@labels":["Source","Polarity"]},"INPUT_CIP":{"@translations":{"english":{"name":"CIP","description":""},"korean":{"name":"CIP","description":""},"spanish":{"name":"Limpieza CIP","description":""},"french":{"name":"CIP","description":""},"portuguese":{"name":"Limpeza CIP","description":""},"italian":{"name":"Pulizia CIP","description":""},"german":{"name":"CIP","description":""},"turkish":{"name":"CIP","description":""}},"children":["INPUT_POL_CIP"],"@labels":["Source","Polarity"]},"INPUT_CIP_TEST":{"@translations":{"english":{"name":"CIP Test","description":""},"korean":{"name":"CIP 테스트","description":""},"spanish":{"name":"Limpieza CIP TEST","description":""},"french":{"name":"CIP Teste","description":""},"portuguese":{"name":"Limpeza CIP Test","description":""},"italian":{"name":"Pulizia CIP Test","description":""},"german":{"name":"CIP Test","description":""},"turkish":{"name":"CIP Test","description":""}},"children":["INPUT_POL_CIP_TEST"],"@labels":["Source","Polarity"]},"INPUT_CIP_PLC":{"@translations":{"english":{"name":"CIP PLC","description":""},"korean":{"name":"CIP PLC","description":""},"spanish":{"name":"Limpieza CIP PLC","description":""},"french":{"name":"CIP PLC","description":""},"portuguese":{"name":"Limpeza CIP PLC","description":""},"italian":{"name":"Pulizia CIP PLC","description":""},"german":{"name":"CIP PLC","description":""},"turkish":{"name":"CIP PLC","description":""}},"children":["INPUT_POL_CIP_PLC"],"@labels":["Source","Polarity"]},"INPUT_PHASE_HOLD":{"@translations":{"english":{"name":"Phase Hold","description":""},"korean":{"name":"페이즈 유지","description":""},"spanish":{"name":"retención de fase","description":""},"french":{"name":"maintien de phase","description":""},"portuguese":{"name":"espera de fase","description":""},"italian":{"name":"tenuta di fase","description":""},"german":{"name":"Phase halten","description":""},"turkish":{"name":"Phase Hold","description":""}},"children":["INPUT_POL_PHASE_HOLD"],"@labels":["Source","Polarity"]},"INPUT_PROD_SEL1":{"@translations":{"english":{"name":"Product Select 1","description":""},"korean":{"name":"품목 선택 1","description":""},"spanish":{"name":"Selección Producto 1","description":""},"french":{"name":"Sélection Produit 1","description":""},"portuguese":{"name":"Seleção Produto 1","description":""},"italian":{"name":"Selezione Prodotto 1","description":""},"german":{"name":"Produkt Eing.1","description":"Die Produkt-Eingänge 1-4 können zur Umschaltung zwischen den Produkten verwendetet werden. Hierzu wird der Binärcode auf die Eingänge angewendet."},"turkish":{"name":"Product Select 1","description":""}},"children":["INPUT_POL_PROD_SEL1"],"@labels":["Source","Polarity"]},"INPUT_PROD_SEL2":{"@translations":{"english":{"name":"Product Select 2","description":""},"korean":{"name":"품목 선택 2","description":""},"spanish":{"name":"Selección Producto 2","description":""},"french":{"name":"Sélection Produit 2","description":""},"portuguese":{"name":"Seleção Produto 2","description":""},"italian":{"name":"Selezione Prodotto 2","description":""},"german":{"name":"Produkt Eing.2","description":"Die Produkt-Eingänge 1-4 können zur Umschaltung zwischen den Produkten verwendetet werden. Hierzu wird der Binärcode auf die Eingänge angewendet."},"turkish":{"name":"Product Select 2","description":""}},"children":["INPUT_POL_PROD_SEL2"],"@labels":["Source","Polarity"]},"INPUT_PROD_SEL3":{"@translations":{"english":{"name":"Product Select 3","description":""},"korean":{"name":"품목 선택 3","description":""},"spanish":{"name":"Selección Producto 3","description":""},"french":{"name":"Sélection Produit 3","description":""},"portuguese":{"name":"Seleção Produto 3","description":""},"italian":{"name":"Selezione Prodotto 3","description":""},"german":{"name":"Produkt Eing.3","description":"Die Produkt-Eingänge 1-4 können zur Umschaltung zwischen den Produkten verwendetet werden. Hierzu wird der Binärcode auf die Eingänge angewendet."},"turkish":{"name":"Product Select 3","description":""}},"children":["INPUT_POL_PROD_SEL3"],"@labels":["Source","Polarity"]},"INPUT_PROD_SEL4":{"@translations":{"english":{"name":"Product Select 4","description":""},"korean":{"name":"품목 선택 4","description":""},"spanish":{"name":"Selección Producto 4","description":""},"french":{"name":"Sélection Poduit 4","description":""},"portuguese":{"name":"Seleção Produto 4","description":""},"italian":{"name":"Selezione Prodotto 4","description":""},"german":{"name":"Produkt Eing. 4","description":"Die Produkt-Eingänge 1-4 können zur Umschaltung zwischen den Produkten verwendetet werden. Hierzu wird der Binärcode auf die Eingänge angewendet."},"turkish":{"name":"Product Select 4","description":""}},"children":["INPUT_POL_PROD_SEL4"],"@labels":["Source","Polarity"]},"INPUT_TEST":{"@translations":{"english":{"name":"Test","description":""},"korean":{"name":"테스트","description":""},"spanish":{"name":"Test","description":""},"french":{"name":"Test","description":""},"portuguese":{"name":"Teste","description":""},"italian":{"name":"Test","description":""},"german":{"name":"Test","description":"Die Produkt-Eingänge 1-4 können zur Umschaltung zwischen den Produkten verwendetet werden. Hierzu wird der Binärcode auf die Eingänge angewendet."},"turkish":{"name":"Test","description":""}},"children":["INPUT_POL_TEST"],"@labels":["Source","Polarity"]},"OUT_PHY_PL3_1":{"@translations":{"english":{"name":"PL3 1","description":""},"korean":{"name":"PL3 1","description":""},"spanish":{"name":"PL3 1","description":""},"french":{"name":"PL3 1","description":""},"portuguese":{"name":"PL3 1","description":""},"italian":{"name":"PL3 1","description":""},"german":{"name":"PL3 1","description":""},"turkish":{"name":"PL3 1","description":""}},"children":["OUT_POL_PL3_1"],"@labels":["Source","Polarity"]},"OUT_PHY_PL11_1A2":{"@translations":{"english":{"name":"PL11 1A2","description":""},"korean":{"name":"PL11 1A2","description":""},"spanish":{"name":"PL11 1A2","description":""},"french":{"name":"PL11 1A2","description":""},"portuguese":{"name":"PL11 1A2","description":""},"italian":{"name":"PL11 1A2","description":""},"german":{"name":"PL11 1A2","description":""},"turkish":{"name":"PL11 1A2","description":""}},"children":["OUT_POL_PL11_1A2"],"@labels":["Source","Polarity"]},"OUT_PHY_PL11_3A4":{"@translations":{"english":{"name":"PL11 3A4","description":""},"korean":{"name":"PL11 3A4","description":""},"spanish":{"name":"PL11 3A4","description":""},"french":{"name":"PL11 3A4","description":""},"portuguese":{"name":"PL11 3A4","description":""},"italian":{"name":"PL11 3A4","description":""},"german":{"name":"PL11 3A4","description":""},"turkish":{"name":"PL11 3A4","description":""}},"children":["OUT_POL_PL11_3A4"],"@labels":["Source","Polarity"]},"OUT_PHY_PL11_5A6":{"@translations":{"english":{"name":"PL11 5A6","description":""},"korean":{"name":"PL11 5A6","description":""},"spanish":{"name":"PL11 5A6","description":""},"french":{"name":"PL11 5A6","description":""},"portuguese":{"name":"PL11 5A6","description":""},"italian":{"name":"PL11 5A6","description":""},"german":{"name":"PL11 5A6","description":""},"turkish":{"name":"PL11 5A6","description":""}},"children":["OUT_POL_PL11_5A6"],"@labels":["Source","Polarity"]},"OUT_PHY_PL4_1":{"@translations":{"english":{"name":"PL4 1","description":""},"korean":{"name":"PL4 1","description":""},"spanish":{"name":"PL4 1","description":""},"french":{"name":"PL4 1","description":""},"portuguese":{"name":"PL4 1","description":""},"italian":{"name":"PL4 1","description":""},"german":{"name":"PL4 1","description":""},"turkish":{"name":"PL4 1","description":""}},"children":["OUT_POL_PL4_1"],"@labels":["Source","Polarity"]},"OUT_PHY_PL4_2":{"@translations":{"english":{"name":"PL4 2","description":""},"korean":{"name":"PL4 2","description":""},"spanish":{"name":"PL4 2","description":""},"french":{"name":"PL4 2","description":""},"portuguese":{"name":"PL4 2","description":""},"italian":{"name":"PL4 2","description":""},"german":{"name":"PL4 2","description":""},"turkish":{"name":"PL4 2","description":""}},"children":["OUT_POL_PL4_2"],"@labels":["Source","Polarity"]},"OUT_PHY_PL4_3":{"@translations":{"english":{"name":"PL4 3","description":""},"korean":{"name":"PL4 3","description":""},"spanish":{"name":"PL4 3","description":""},"french":{"name":"PL4 3","description":""},"portuguese":{"name":"PL4 3","description":""},"italian":{"name":"PL4 3","description":""},"german":{"name":"PL4 3","description":""},"turkish":{"name":"PL4 3","description":""}},"children":["OUT_POL_PL4_3"],"@labels":["Source","Polarity"]},"OUT_PHY_PL4_5":{"@translations":{"english":{"name":"PL4 5","description":""},"korean":{"name":"PL4 5","description":""},"spanish":{"name":"PL4 5","description":""},"french":{"name":"PL4 5","description":""},"portuguese":{"name":"PL4 5","description":""},"italian":{"name":"PL4 5","description":""},"german":{"name":"PL4 5","description":""},"turkish":{"name":"PL4 5","description":""}},"children":["OUT_POL_PL4_5"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_R1":{"@translations":{"english":{"name":"IO PL3 R1","description":""},"korean":{"name":"IO PL3 R1","description":""},"spanish":{"name":"IO PL3 R1","description":""},"french":{"name":"IO PL3 R1","description":""},"portuguese":{"name":"IO PL3 R1","description":""},"italian":{"name":"IO PL3 R1","description":""},"german":{"name":"IO PL3 R1","description":""},"turkish":{"name":"IO PL3 R1","description":""}},"children":["OUT_POL_IO_PL3_R1"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_R2":{"@translations":{"english":{"name":"IO PL3 R2","description":""},"korean":{"name":"IO PL3 R2","description":""},"spanish":{"name":"IO PL3 R2","description":""},"french":{"name":"IO PL3 R2","description":""},"portuguese":{"name":"IO PL3 R2","description":""},"italian":{"name":"IO PL3 R2","description":""},"german":{"name":"IO PL3 R2","description":""},"turkish":{"name":"IO PL3 R2","description":""}},"children":["OUT_POL_IO_PL3_R2"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_O1":{"@translations":{"english":{"name":"IO PL3 O1","description":""},"korean":{"name":"IO PL3 O1","description":""},"spanish":{"name":"IO PL3 O1","description":""},"french":{"name":"IO PL3 O1","description":""},"portuguese":{"name":"IO PL3 O1","description":""},"italian":{"name":"IO PL3 O1","description":""},"german":{"name":"IO PL3 O1","description":""},"turkish":{"name":"IO PL3 O1","description":""}},"children":["OUT_POL_IO_PL3_O1"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_O2":{"@translations":{"english":{"name":"IO PL3 O2","description":""},"korean":{"name":"IO PL3 O2","description":""},"spanish":{"name":"IO PL3 O2","description":""},"french":{"name":"IO PL3 O2","description":""},"portuguese":{"name":"IO PL3 O2","description":""},"italian":{"name":"IO PL3 O2","description":""},"german":{"name":"IO PL3 O2","description":""},"turkish":{"name":"IO PL3 O2","description":""}},"children":["OUT_POL_IO_PL3_O2"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_O3":{"@translations":{"english":{"name":"IO PL3 O3","description":""},"korean":{"name":"IO PL3 O3","description":""},"spanish":{"name":"IO PL3 O3","description":""},"french":{"name":"IO PL3 O3","description":""},"portuguese":{"name":"IO PL3 O3","description":""},"italian":{"name":"IO PL3 O3","description":""},"german":{"name":"IO PL3 O3","description":""},"turkish":{"name":"IO PL3 O3","description":""}},"children":["OUT_POL_IO_PL3_O3"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL4_02":{"@translations":{"english":{"name":"IO PL4 02","description":""},"korean":{"name":"IO PL4 02","description":""},"spanish":{"name":"IO PL4 02","description":""},"french":{"name":"IO PL4 02","description":""},"portuguese":{"name":"IO PL4 02","description":""},"italian":{"name":"IO PL4 02","description":""},"german":{"name":"IO PL4 02","description":""},"turkish":{"name":"IO PL4 02","description":""}},"children":["OUT_POL_IO_PL4_02"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL4_03":{"@translations":{"english":{"name":"IO PL4 03","description":""},"korean":{"name":"IO PL4 03","description":""},"spanish":{"name":"IO PL4 03","description":""},"french":{"name":"IO PL4 03","description":""},"portuguese":{"name":"IO PL4 03","description":""},"italian":{"name":"IO PL4 03","description":""},"german":{"name":"IO PL4 03","description":""},"turkish":{"name":"IO PL4 03","description":""}},"children":["OUT_POL_IO_PL4_03"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL4_04":{"@translations":{"english":{"name":"IO PL4 04","description":""},"korean":{"name":"IO PL4 04","description":""},"spanish":{"name":"IO PL4 04","description":""},"french":{"name":"IO PL4 04","description":""},"portuguese":{"name":"IO PL4 04","description":""},"italian":{"name":"IO PL4 04","description":""},"german":{"name":"IO PL4 04","description":""},"turkish":{"name":"IO PL4 04","description":""}},"children":["OUT_POL_IO_PL4_04"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL4_05":{"@translations":{"english":{"name":"IO PL4 05","description":""},"korean":{"name":"IO PL4 05","description":""},"spanish":{"name":"IO PL4 05","description":""},"french":{"name":"IO PL4 05","description":""},"portuguese":{"name":"IO PL4 05","description":""},"italian":{"name":"IO PL4 05","description":""},"german":{"name":"IO PL4 05","description":""},"turkish":{"name":"IO PL4 05","description":""}},"children":["OUT_POL_IO_PL4_05"],"@labels":["Source","Polarity"]},"SRecordDate":{"@translations":{"english":{"name":"System Record Date","description":""},"korean":{"name":"시스템 기록일","description":""},"spanish":{"name":"Fecha Registro Sistema","description":""},"french":{"name":"Système Enregistrement Date","description":""},"portuguese":{"name":"Data do Registro do Sistema","description":""},"italian":{"name":"Data Registrazione Sistema","description":""},"german":{"name":"Datum System-Datenerfassung","description":""},"turkish":{"name":"System Record Date","description":""}},"children":[],"@labels":["System Record Date"]},"ProdNo":{"@translations":{"english":{"name":"Product Number","description":""},"korean":{"name":"품목 번호","description":""},"spanish":{"name":"Número Producto","description":""},"french":{"name":"Numéro Produit","description":""},"portuguese":{"name":"Numero do Produto","description":""},"italian":{"name":"Numero Prodotto","description":""},"german":{"name":"Produkt Nummer","description":""},"turkish":{"name":"Product Number","description":""}},"children":[],"@labels":["Product Number"]},"Unit":{"@translations":{"english":{"name":"Unit","description":""},"korean":{"name":"유닛","description":""},"spanish":{"name":"Unidad","description":""},"french":{"name":"Unité","description":""},"portuguese":{"name":"Unidade","description":""},"italian":{"name":"Unità","description":""},"german":{"name":"Einheit","description":""},"turkish":{"name":"Unit","description":""}},"children":[],"@labels":["Unit"]},"RefFaultMask":{"@translations":{"english":{"name":"Reference Fault","description":""},"korean":{"name":"참조 폴트","description":""},"spanish":{"name":"Fallo Referencia","description":""},"french":{"name":" Référer Défaillance/Erreur ","description":""},"portuguese":{"name":"Falha de Refêrencia","description":""},"italian":{"name":"Errore di Riferimento","description":""},"german":{"name":"Referenz Fehler","description":""},"turkish":{"name":"Reference Fault","description":""}},"children":[],"@labels":["Reference Fault"]},"BalFaultMask":{"@translations":{"english":{"name":"Balance Fault","description":""},"korean":{"name":"발란스 폴트","description":""},"spanish":{"name":"Fallo Balanceo","description":""},"french":{"name":"Défaillance/Erreur Balance","description":""},"portuguese":{"name":"Falha do Balance","description":""},"italian":{"name":"Errore di Equilibrio","description":""},"german":{"name":"Balance Fehler","description":""},"turkish":{"name":"Balance Fault","description":""}},"children":[],"@labels":["Balance Fault"]},"ProdMemFaultMask":{"@translations":{"english":{"name":"Product Memory Fault","description":""},"korean":{"name":"품목 메모리 폴트","description":""},"spanish":{"name":"Fallo Memoria Producto","description":""},"french":{"name":"Défaillance/Erreur Mémoire du Produit","description":""},"portuguese":{"name":"Falha Memoria do produto","description":""},"italian":{"name":"Errore Memoria Prodotto","description":""},"german":{"name":"Fehler Produktspeicher","description":""},"turkish":{"name":"Product Memory Fault","description":""}},"children":[],"@labels":["Product Memory Fault"]},"RejConfirmFaultMask":{"@translations":{"english":{"name":"Reject Confirm Fault","description":""},"korean":{"name":"리젝트 컨펌 폴트","description":""},"spanish":{"name":"Fallo Confirmación Rechazo","description":""},"french":{"name":"Défaillance/Erreur de Confirmation de rejet","description":""},"portuguese":{"name":"Falha Comfirmação de Rejeção","description":""},"italian":{"name":"Errore Conferma Rifiuto","description":""},"german":{"name":"Fehler Auswurfbestätigung","description":""},"turkish":{"name":"Reject Confirm Fault","description":""}},"children":[],"@labels":["Reject Confirm Fault"]},"PhaseFaultMask":{"@translations":{"english":{"name":"Phase Fault","description":""},"korean":{"name":"페이즈 폴트","description":""},"spanish":{"name":"Fallo Fase","description":""},"french":{"name":"Défaillance/Erreur Phase","description":""},"portuguese":{"name":"Falha da Fase","description":""},"italian":{"name":"Errore di Fase","description":""},"german":{"name":"Phasen Fehler","description":""},"turkish":{"name":"Phase Fault","description":""}},"children":[],"@labels":["Phase Fault"]},"TestSigFaultMask":{"@translations":{"english":{"name":"Test Signal Fault","description":""},"korean":{"name":"테스트 시그널 폴트","description":""},"spanish":{"name":"Fallo Señal Test","description":""},"french":{"name":"Défaillance/Erreur Signal Essai/Test","description":""},"portuguese":{"name":"Falha do Sinal do Teste","description":""},"italian":{"name":"Errore Segnale Test","description":""},"german":{"name":"Test Signal Fehler","description":""},"turkish":{"name":"Test Signal Fault","description":""}},"children":[],"@labels":["Test Signal Fault"]},"PeyeBlockFaultMask":{"@translations":{"english":{"name":"Photoeye Block Fault","description":"The photo eye has been or is blocked for longer than expected. "},"korean":{"name":"포토아이 차단 폴트","description":""},"spanish":{"name":"Fallo Bloqueo Fotocélula","description":""},"french":{"name":"Défaillance/Erreur Capteur Optique Obstrué","description":"Le capteur optique a été ou est bloqué plus longtemps que prévu"},"portuguese":{"name":"Falha Fotocélula Bloqueado","description":""},"italian":{"name":"Errore Blocco Fotocellula","description":""},"german":{"name":"Lichtschranken Fehler","description":"Die Lichtschranke wurde länger als erwartet blockiert. "},"turkish":{"name":"Photoeye Block Fault","description":"The photo eye has been or is blocked for longer than expected. "}},"children":[],"@labels":["Photoeye Block Fault"]},"RejBinFullFaultMask":{"@translations":{"english":{"name":"Reject Bin Full Fault","description":"The reject bin is full"},"korean":{"name":"리젝트 보관함 용량초과 폴트","description":""},"spanish":{"name":"Fallo Contenedor Rechazo Lleno","description":""},"french":{"name":"Défaillance/Erreur de Contenant Plein","description":"Le contenant de rejets est plein"},"portuguese":{"name":"Falha Caixa Cheia","description":""},"italian":{"name":"Errore Contenitore Pieno","description":""},"german":{"name":"Fehler Auswurfbehälter voll","description":"Der Auswurfbehälter ist voll, bitte leeren."},"turkish":{"name":"Reject Bin Full Fault","description":"The reject bin is full"}},"children":[],"@labels":["Reject Bin Full Fault"]},"RejBinDoorFaultMask":{"@translations":{"english":{"name":"Reject Bin Door Fault","description":"The reject bin door is open"},"korean":{"name":"리젝트 보관함 용량초과 폴트","description":""},"spanish":{"name":"Fallo Contenedor Rechazo Lleno","description":""},"french":{"name":"Défaillance/Erreur de Contenant Plein","description":"Le contenant de rejets est plein"},"portuguese":{"name":"Falha Caixa Cheia","description":""},"italian":{"name":"Errore Contenitore Pieno","description":""},"german":{"name":"Fehler Auswurfbehälter voll","description":"Der Auswurfbehälter ist voll, bitte leeren."},"turkish":{"name":"Reject Bin Door Fault","description":"The reject bin door is open"}},"children":[],"@labels":["Reject Bin Full Fault"]},"AirFaultMask":{"@translations":{"english":{"name":"Air Pressure Fault","description":"Air pressure is too low, or not present"},"korean":{"name":"공기 폴트","description":""},"spanish":{"name":"Fallo Presión Aire","description":""},"french":{"name":"Défaillance/Erreur Pression d'Air","description":"Pression d’air basse ou non existante"},"portuguese":{"name":"Fala Pressão de AR","description":""},"italian":{"name":"Errore Pressione Aria","description":""},"german":{"name":"Fehler Druckluft","description":"Der Druck der Druckluft ist zu niedrig oder komplett abgeschaltet."},"turkish":{"name":"Air Pressure Fault","description":"Air pressure is too low, or not present"}},"children":[],"@labels":["Air Fault"]},"ExcessRejFaultMask":{"@translations":{"english":{"name":"Excess Rejects Fault","description":"The number of rejects has exceeded the number set"},"korean":{"name":"리젝트 초과 폴트","description":""},"spanish":{"name":"Fallo Exceso Rechazos","description":""},"french":{"name":"Défaillance/Erreur Rejets Excessifs","description":"Le nombre de rejets dépasse le nombre établi"},"portuguese":{"name":"Falha excesso de Rejeçoes","description":""},"italian":{"name":"Errore Eccedenza Rifiuti","description":""},"german":{"name":"Fehler zuviele Auswürfe","description":"Die Anzahl der Auswürfe pro Zeiteinheit hat den voreingestellten Wert überschritten."},"turkish":{"name":"Excess Rejects Fault","description":"The number of rejects has exceeded the number set"}},"children":[],"@labels":["Excess Rejects Fault"]},"BigMetalFaultMask":{"@translations":{"english":{"name":"Large Metal Fault","description":""},"korean":{"name":"대량금속 폴트","description":""},"spanish":{"name":"Fallo Metal Grande","description":""},"french":{"name":"Défaillance/Erreur Large Métal ","description":""},"portuguese":{"name":"Falha Metal Grande","description":""},"italian":{"name":"Errore Metallo Grande","description":""},"german":{"name":"Fehler großes Metall","description":""},"turkish":{"name":"Large Metal Fault","description":""}},"children":[],"@labels":["Large Metal Fault"]},"NetBufferFaultMask":{"@translations":{"english":{"name":"Net Buffer Fault","description":""},"korean":{"name":"넷 버퍼 폴트","description":""},"spanish":{"name":"Fallo Buffer Red","description":""},"french":{"name":"Défaillance/Erreur Net Buffer","description":""},"portuguese":{"name":"Falha Net Buffer ","description":""},"italian":{"name":"Errore Buffer di Rete","description":""},"german":{"name":"Fehler Netzpuffer","description":""},"turkish":{"name":"Net Buffer Fault","description":""}},"children":[],"@labels":["Net Buffer Fault"]},"RejMemoryFaultMask":{"@translations":{"english":{"name":"Reject Memory Fault","description":""},"korean":{"name":"리젝트 메모리 폴트","description":""},"spanish":{"name":"Fallo Memoria Rechazo","description":""},"french":{"name":"Défaillance/Erreur Mémoire Rejet","description":""},"portuguese":{"name":"Falha Memoria de Rejeção","description":""},"italian":{"name":"Errore Memoria Rifuti","description":""},"german":{"name":"Fehler Auswurf-Speicherung ","description":""},"turkish":{"name":"Reject Memory Fault","description":""}},"children":[],"@labels":["Reject Memory Fault"]},"RejectExitFaultMask":{"@translations":{"english":{"name":"Reject Exit Fault","description":"A reject has passed through the exit photo eye; the reject device may not be functioning correctly"},"korean":{"name":"리젝트 퇴장 폴트","description":""},"spanish":{"name":"Fallo Salida Rechazo","description":""},"french":{"name":"Défaillance/Erreur Sortie Rejet","description":"Un rejet a passé par le capteur optique de sortie; le système de rejet peut être défectueux"},"portuguese":{"name":"Falha Saida de rejeção","description":""},"italian":{"name":"Errore Uscita Rifiuto","description":""},"german":{"name":"Fehler Ausgangslichtschranke","description":"Ein Ausschuss hat das Ausgangslichtschranke passiert; Die Auswurfvorrichtung funktioniert möglicherweise nicht richtig"},"turkish":{"name":"Reject Exit Fault","description":"A reject has passed through the exit photo eye; the reject device may not be functioning correctly"}},"children":[],"@labels":["Reject Exit Fault"]},"TachometerFaultMask":{"@translations":{"english":{"name":"Tachometer Fault","description":"No signal is being recieved from the tachometer when the unit is set to external timing"},"korean":{"name":"타코미터 폴트","description":""},"spanish":{"name":"Fallo Tacómetro","description":""},"french":{"name":"Défaillance/Erreur Tachymètre","description":"Aucun signal, émis par le Tachymètre, n’est capté lorsque l’unité est réglée à une minuterie externe"},"portuguese":{"name":"Falha Tacômetro","description":""},"italian":{"name":"Errore Tachimetro","description":""},"german":{"name":"Fehler Impulsgeber","description":"Vom externen Impulsgeber estellt ist, wird kein Signal registriert."},"turkish":{"name":"Tachometer Fault","description":"No signal is being recieved from the tachometer when the unit is set to external timing"}},"children":[],"@labels":["Tachometer Fault"]},"PatternFaultMask":{"@translations":{"english":{"name":"Pattern Fault","description":""},"korean":{"name":"패턴 폴트","description":""},"spanish":{"name":"Fallo Patrón","description":""},"french":{"name":"Défaillance/Erreur Configuration","description":""},"portuguese":{"name":"Pattern Fault","description":""},"italian":{"name":"Errore Modello","description":""},"german":{"name":"Muster Fehler","description":""},"turkish":{"name":"Pattern Fault","description":""}},"children":[],"@labels":["Pattern Fault"]},"ExitNoPackFaultMask":{"@translations":{"english":{"name":"Exit No Pack Fault","description":"A pack that passed through the infeed eye did not pass through the exit eye"},"korean":{"name":"퇴장 팩 없음 폴트","description":""},"spanish":{"name":"Fallo Salida sin Producto","description":""},"french":{"name":"Défaillance/Erreur Paquet Sortie","description":"Un paquet qui a passé devant le capteur optique d’entrée mais n’a pas passé devant le capteur optique de sortie"},"portuguese":{"name":"Falha Saida Sem Produto","description":""},"italian":{"name":"Errore Uscita Senza Prodotto","description":""},"german":{"name":"Fehler keine Ausgangspackung","description":"Ein Packung wurde Einlauflichtschranke registriert, aber nicht von der Ausgangslichtschranke. "},"turkish":{"name":"Exit No Pack Fault","description":"A pack that passed through the infeed eye did not pass through the exit eye"}},"children":[],"@labels":["Exit No Pack Fault"]},"ExitNewPackFaultMask":{"@translations":{"english":{"name":"Exit New Pack Fault","description":"A pack which did not pass through the infeed eye or aperture has passed through the exit eye"},"korean":{"name":"퇴장 새 팩 폴트","description":""},"spanish":{"name":"Fallo Salida Nuevo Paquete","description":""},"french":{"name":"Défaillance/Erreur Nouveau Paquet Sortie","description":"Un paquet qui n’a pas passé par le capteur optique d’entrée ou par l’ouverture est passé par le capteur optique de sortie."},"portuguese":{"name":"Exit New Pack Fault","description":""},"italian":{"name":"Errore Uscita Nuovo Pacco","description":""},"german":{"name":"Fehler Ausgang-neue-Packung","description":"Es wurde keine Packung von der Einlauflichtschranke oder dem Suchkopf registriert, aber von der Ausgangslichtschranke. "},"turkish":{"name":"Exit New Pack Fault","description":"A pack which did not pass through the infeed eye or aperture has passed through the exit eye"}},"children":[],"@labels":["Exit New Pack Fault"]},"InterceptorFaultMask":{"@translations":{"english":{"name":"Interceptor Fault","description":""},"korean":{"name":"인터셉터 폴트","description":""},"spanish":{"name":"Fallo Interceptor","description":""},"french":{"name":"Défaillance/Erreur Intercepteur","description":""},"portuguese":{"name":"Falha Interceptor","description":""},"italian":{"name":"Errore Interceptor","description":""},"german":{"name":"Interceptor Fehler","description":""},"turkish":{"name":"Interceptor Fault","description":""}},"children":[],"@labels":["Interceptor Fault"]},"RtcLowBatFaultMask":{"@translations":{"english":{"name":"RTC Low Battery Fault","description":"The CR2032 coil cell battery on the DSP board is low and should be replaced"},"korean":{"name":"Rtc 로우 배터리 폴트","description":""},"spanish":{"name":"Fallo Batería RTC","description":""},"french":{"name":"Défaillance/Erreur RTC Pile Faible","description":"La pile CR2032 sur le panneau DSP est faible et devrait être remplacée"},"portuguese":{"name":"Falha Bateria","description":""},"italian":{"name":"Errore Batteria Scarica RTC","description":""},"german":{"name":"Echtzeituhr-Batterie Fehler","description":"Die Spannung der CR2032 Knopfzelle auf der DSP-Karte ist niedrig und sollte ersetzt werden."},"turkish":{"name":"RTC Low Battery Fault","description":"The CR2032 coil cell battery on the DSP board is low and should be replaced"}},"children":[],"@labels":["Rtc Low Batter Fault"]},"RtcTimeFaultMask":{"@translations":{"english":{"name":"RTC Time Fault","description":""},"korean":{"name":"Rtc 시간 폴트","description":""},"spanish":{"name":"Fallo Hora","description":""},"french":{"name":"Défaillance/Erreur Temps RTC","description":""},"portuguese":{"name":"Falha Horario","description":""},"italian":{"name":"Errore Ora RTC","description":""},"german":{"name":"Fehler Echtzeituhr","description":""},"turkish":{"name":"RTC Time Fault","description":""}},"children":[],"@labels":["Rtc Time Fault"]},"IntUsbFaultMask":{"@translations":{"english":{"name":"Internal USB Fault","description":"The internal USB on the DSP board has an issue and may need to be replaced"},"korean":{"name":"내부 Usb 폴트","description":""},"spanish":{"name":"Fallo USB Interno","description":""},"french":{"name":"Défaillance/Erreur USB Interne","description":"Le USB interne sur le panneau DSP a un problème et aurait peut-être besoin d’être remplacé"},"portuguese":{"name":"Falha USB Interno","description":""},"italian":{"name":"Errore USB Interno","description":""},"german":{"name":"Interner USB Fehler","description":"Der interne USB-Anschluss an der DSP-Karte weist ein Problem auf und muss möglicherweise ausgetauscht werden"},"turkish":{"name":"Internal USB Fault","description":"The internal USB on the DSP board has an issue and may need to be replaced"}},"children":[],"@labels":["Int Usb Fault"]},"IoBoardFaultMask":{"@translations":{"english":{"name":"IO Board Fault","description":""},"korean":{"name":"IO 보드 폴트","description":""},"spanish":{"name":"Fallo Placa IO","description":""},"french":{"name":"Défaillance/Erreur Panneau IO","description":""},"portuguese":{"name":"Falha Placa IO","description":""},"italian":{"name":"Errore Scheda IO","description":""},"german":{"name":"IO-Karten Fehler","description":""},"turkish":{"name":"IO Board Fault","description":""}},"children":[],"@labels":["IO Board Fault"]},"HaloFaultMask":{"@translations":{"english":{"name":"Halo Board Fault","description":""},"korean":{"name":"헤일로 폴트","description":""},"spanish":{"name":"Fallo Halo","description":""},"french":{"name":"Défaillance/Erreur Panneau Halo","description":""},"portuguese":{"name":"Falha Halo","description":""},"italian":{"name":"Errore Halo","description":""},"german":{"name":"Halo-Karten Fehler","description":""},"turkish":{"name":"Halo Board Fault","description":""}},"children":[],"@labels":["Halo Fault"]},"SignalFaultMask":{"@translations":{"english":{"name":"Signal Fault","description":""},"korean":{"name":"시그널 폴트","description":""},"spanish":{"name":"Fallo Señal","description":""},"french":{"name":"Défaillance/Erreur Signal","description":""},"portuguese":{"name":"Falha Sinal","description":""},"italian":{"name":"Errore di Segnale","description":""},"german":{"name":"Signal-Fehler","description":""},"turkish":{"name":"Signal Fault","description":""}},"children":[],"@labels":["Signal Fault"]},"IOBoardLocate":{"@translations":{"english":{"name":"IO Board Locate","description":""},"korean":{"name":"IO 보드 추적","description":""},"spanish":{"name":"IO Board Locate","description":""},"french":{"name":"Localiser Panneau IO","description":""},"portuguese":{"name":"IO Board Locate","description":""},"italian":{"name":"Localizzare Scheda IO","description":""},"german":{"name":"IO-Karte Lokalisierung","description":""},"turkish":{"name":"IO Board Locate","description":""}},"children":[],"@labels":["Locate"]},"InternalIP":{"@type":"IP","@translations":{"english":{"name":"Internal IP","description":""},"korean":{"name":"내부 IP","description":""},"spanish":{"name":"Internal IP","description":""},"french":{"name":"IP Interne","description":""},"portuguese":{"name":"Internal IP","description":""},"italian":{"name":"Indirizzo IP Interno","description":""},"german":{"name":"Interne IP","description":""},"turkish":{"name":"Internal IP","description":""}},"children":[],"@labels":["IP"]},"InternalNM":{"@type":"IP","@translations":{"english":{"name":"Internal Netmask","description":""},"korean":{"name":"내부 Netmask","description":""},"spanish":{"name":"Internal Netmask","description":""},"french":{"name":"Netmask Interne","description":""},"portuguese":{"name":"Internal Netmask","description":""},"italian":{"name":"Netmask Interno","description":""},"german":{"name":"Interne Netzmaske","description":""},"turkish":{"name":"Internal Netmask","description":""}},"children":[],"@labels":["IP"]},"InternalGW":{"@type":"IP","@translations":{"english":{"name":"Internal Gateway","description":""},"korean":{"name":"내부 Gateway","description":""},"spanish":{"name":"Internal Gateway","description":""},"french":{"name":"Gateway Interne","description":""},"portuguese":{"name":"Internal Gateway","description":""},"italian":{"name":"Indirizzo Gateway Interno","description":""},"german":{"name":"Internes Gateway","description":""},"turkish":{"name":"Internal Gateway","description":""}},"children":[],"@labels":["IP"]},"HaloIP":{"@type":"IP","@translations":{"english":{"name":"Halo IP","description":""},"korean":{"name":"Halo IP","description":""},"spanish":{"name":"Halo IP","description":""},"french":{"name":"Halo IP","description":""},"portuguese":{"name":"Halo IP","description":""},"italian":{"name":"Indirizzo IP Halo","description":""},"german":{"name":"Halo IP","description":""},"turkish":{"name":"Halo IP","description":""}},"children":[],"@labels":["IP"]},"HaloLocate":{"@translations":{"english":{"name":"Halo Locate","description":""},"korean":{"name":"Halo 추적","description":""},"spanish":{"name":"Halo Locate","description":""},"french":{"name":" Localiser Halo","description":""},"portuguese":{"name":"Halo Locate","description":""},"italian":{"name":"Localizzare Halo","description":""},"german":{"name":"Halo Lokalisierung","description":""},"turkish":{"name":"Halo Locate","description":""}},"children":[],"@labels":["Locations"]},"IOBoardIP":{"@type":"IP","@translations":{"english":{"name":"IO Board IP","description":""},"korean":{"name":"IO 보드 IP","description":""},"spanish":{"name":"IO Board IP","description":""},"french":{"name":"Panneau IP, IO","description":""},"portuguese":{"name":"IO Board IP","description":""},"italian":{"name":"Indirizzo IP Scheda IO","description":""},"german":{"name":"IO-Karten IP","description":""},"turkish":{"name":"IO Board IP","description":""}},"children":[],"@labels":["IP"]},"IOBoardType":{"@translations":{"english":{"name":"IO Board","description":""},"korean":{"name":"IO 보드","description":""},"spanish":{"name":"IO Board","description":""},"french":{"name":"Panneau IO","description":""},"portuguese":{"name":"IO Board","description":""},"italian":{"name":"Scheda IO","description":""},"german":{"name":"IO-Karten","description":""},"turkish":{"name":"IO Board","description":""}},"children":[],"@labels":["IP"]},"DspName":{"@translations":{"english":{"name":"Detector Name","description":""},"korean":{"name":"디텍터 이름","description":""},"spanish":{"name":"Detector Name","description":""},"french":{"name":"Nom Détecteur","description":""},"portuguese":{"name":"Detector Name","description":""},"italian":{"name":"Nome Detector","description":""},"german":{"name":"Detektor Name","description":""},"turkish":{"name":"Detector Name","description":""}},"children":[],"@labels":["Name"]},"XPortIP":{"@type":"IP","@translations":{"english":{"name":"External IP","description":""},"korean":{"name":"외부 IP","description":""},"spanish":{"name":"External IP","description":""},"french":{"name":" IP Externe","description":""},"portuguese":{"name":"External IP","description":""},"italian":{"name":"Indirizzo IP Esterno","description":""},"german":{"name":"Externe IP","description":""},"turkish":{"name":"External IP","description":""}},"children":[],"@labels":["IP"]},"Nif_ip":{"@type":"IP","@translations":{"english":{"name":"Display IP","description":""},"korean":{"name":"디스플레이 IP","description":""},"spanish":{"name":"Display IP","description":""},"french":{"name":"Écran IP","description":""},"portuguese":{"name":"Display IP","description":""},"italian":{"name":"Indirizzo IP Schermo","description":""},"german":{"name":"Display IP","description":""},"turkish":{"name":"Display IP","description":""}},"children":[],"@labels":["IP"]},"Nif_nm":{"@type":"IP","@translations":{"english":{"name":"Display Netmask","description":""},"korean":{"name":"디스플레이 Netmask","description":""},"spanish":{"name":"Display Netmask","description":""},"french":{"name":"Écran Netmask","description":""},"portuguese":{"name":"Display Netmask","description":""},"italian":{"name":"Display Netmask","description":""},"german":{"name":"Display Netzmaske","description":""},"turkish":{"name":"Display Netmask","description":""}},"children":[],"@labels":["IP"]},"Nif_gw":{"@type":"IP","@translations":{"english":{"name":"Display Gateway","description":""},"korean":{"name":"디스플레이 Gateway","description":""},"spanish":{"name":"Display Gateway","description":""},"french":{"name":"Écran Gateway","description":""},"portuguese":{"name":"Display Gateway","description":""},"italian":{"name":"Display Gateway","description":""},"german":{"name":"Display Gateway","description":""},"turkish":{"name":"Display Gateway","description":""}},"children":[],"@labels":["IP"]},"XPortNM":{"@type":"IP","@translations":{"english":{"name":"External Netmask","description":""},"korean":{"name":"외부 Netmask","description":""},"spanish":{"name":"External Netmask","description":""},"french":{"name":"Netmask Externe","description":""},"portuguese":{"name":"External Netmask","description":""},"italian":{"name":"Netmask Esterno","description":""},"german":{"name":"Externe Netzmaske","description":""},"turkish":{"name":"External Netmask","description":""}},"children":[],"@labels":["IP"]},"XPortGW":{"@type":"IP","@translations":{"english":{"name":"External Gateway","description":""},"korean":{"name":"외부 Gateway","description":""},"spanish":{"name":"External Gateway","description":""},"french":{"name":" Gateway Externe","description":""},"portuguese":{"name":"External Gateway","description":""},"italian":{"name":"Gateway Esterno","description":""},"german":{"name":"Externes Gateway","description":""},"turkish":{"name":"External Gateway","description":""}},"children":[],"@labels":["IP"]},"PassOn":{"@translations":{"english":{"name":"Password On","description":""},"korean":{"name":"비밀번호 액티브","description":""},"spanish":{"name":"Password On","description":""},"french":{"name":"Mot de Passe Activé","description":""},"portuguese":{"name":"Password On","description":""},"italian":{"name":"Password On","description":""},"german":{"name":"Passwort an","description":""},"turkish":{"name":"Password On","description":""}},"children":[],"@labels":["IP"]},"EyePkgLength":{"@translations":{"english":{"name":"Eye Package Length","description":""},"korean":{"name":"패키지 길이","description":""},"spanish":{"name":"Eye Package Length","description":""},"french":{"name":"Capteur Optique Longueur Paquet","description":""},"portuguese":{"name":"Eye Package Length","description":""},"italian":{"name":"Eye Package Length","description":""},"german":{"name":"Lichtschranke Packungslänge","description":""},"turkish":{"name":"Eye Package Length","description":""}},"children":[],"@labels":["IP"]},"EyeDist":{"@translations":{"english":{"name":"Eye Distance","description":""},"korean":{"name":"포토아이 거리","description":""},"spanish":{"name":"Eye Distance","description":""},"french":{"name":"Distance Capteur Optique","description":""},"portuguese":{"name":"Eye Distance","description":""},"italian":{"name":"Eye Distance","description":""},"german":{"name":"Abstand Lichtschranke","description":""},"turkish":{"name":"Eye Distance","description":""}},"children":[],"@labels":["IP"]},"EyeMinGapDist":{"@translations":{"english":{"name":"Minimum Product Gap","description":""},"korean":{"name":"품목 최단거리","description":""},"spanish":{"name":"Minimum Product Gap","description":""},"french":{"name":"Intervalle Minimal Produit","description":""},"portuguese":{"name":"Minimum Product Gap","description":""},"italian":{"name":"Minimum Product Gap","description":""},"german":{"name":"Minimum Produktlücke","description":""},"turkish":{"name":"Minimum Product Gap","description":""}},"children":[],"@labels":["IP"]},"HeadDepth":{"@translations":{"english":{"name":"Head Depth","description":""},"korean":{"name":"헤드 깊이","description":""},"spanish":{"name":"Head Depth","description":""},"french":{"name":"Profondeur Tête","description":""},"portuguese":{"name":"Head Depth","description":""},"italian":{"name":"Head Depth","description":""},"german":{"name":"Öffnungstiefe","description":"Das Maß des Suchkopfes in Förderrichtung."},"turkish":{"name":"Head Depth","description":""}},"children":[],"@labels":["IP"]},"HeadSeparation":{"@translations":{"english":{"name":"Head Separation","description":""},"korean":{"name":"헤드 간격","description":""},"spanish":{"name":"Head Separation","description":""},"french":{"name":"Head Separation","description":""},"portuguese":{"name":"Head Separation","description":""},"italian":{"name":"Head Separation","description":""},"german":{"name":"Head Separation","description":""},"turkish":{"name":"Head Separation","description":""}},"children":[],"@labels":["IP"]},"HeadCoilSp":{"@translations":{"english":{"name":"Head Coil Spacing","description":""},"korean":{"name":"헤드 코일 간격","description":""},"spanish":{"name":"Head Coil Spacing","description":""},"french":{"name":"Espacement Tête de Bobine","description":""},"portuguese":{"name":"Head Coil Spacing","description":""},"italian":{"name":"Head Coil Spacing","description":""},"german":{"name":"Abstand der Suchkopfspulen","description":""},"turkish":{"name":"Head Coil Spacing","description":""}},"children":[],"@labels":["IP"]},"DCRate_A":{"@translations":{"english":{"name":"DC Filter","description":""},"korean":{"name":"DC 필터","description":""},"spanish":{"name":"DC Filter","description":""},"french":{"name":"Filtre DC","description":""},"portuguese":{"name":"DC Filter","description":""},"italian":{"name":"DC Filter","description":""},"german":{"name":"DC Filter","description":"ist für die 0-Abgleichgeschwindigkeit verantwortlich.Hoher Zahlenwert=schnell und umgekehrt."},"turkish":{"name":"DC Filter","description":""}},"children":["DCRate_B"],"@labels":["Channel A","Channel B"]},"DcCoeffNorm_A":{"@translations":{"english":{"name":"DC Coefficient","description":""},"korean":{"name":"DC 계수","description":""},"spanish":{"name":"DC Coefficient","description":""},"french":{"name":"Coéficient DC","description":""},"portuguese":{"name":"DC Coefficient","description":""},"italian":{"name":"DC Coefficient","description":""},"german":{"name":"DC Koefficient","description":"ist für die 0-Abgleichgeschwindigkeit verantwortlich.Hoher Zahlenwert=schnell und umgekehrt."},"turkish":{"name":"DC Coefficient","description":""}},"children":["DcCoeffNorm_B"],"@labels":["Channel A","Channel B"]},"IsoCleanTimeout":{"@translations":{"english":{"name":"Clean Timeout","description":""},"korean":{"name":"클린 진행시간","description":""},"spanish":{"name":"Clean Timeout","description":""},"french":{"name":"Clean Timeout","description":""},"portuguese":{"name":"Clean Timeout","description":""},"italian":{"name":"Clean Timeout","description":""},"german":{"name":"Clean Timeout","description":""},"turkish":{"name":"Clean Timeout","description":""}},"children":[],"@labels":["IsoCleanTimeout"]},"ManReject":{"@translations":{"english":{"name":"Manual Reject","description":""},"korean":{"name":"수동 리젝트","description":""},"spanish":{"name":"Manual Reject","description":""},"french":{"name":"Manual Reject","description":""},"portuguese":{"name":"Manual Reject","description":""},"italian":{"name":"Manual Reject","description":""},"german":{"name":"Manual Reject","description":""},"turkish":{"name":"Manual Reject","description":""}},"children":[],"@labels":["Eye Reject"]},"NTPServerIP":{"@type":"IP","@translations":{"english":{"name":"NTP Server IP","description":""},"korean":{"name":"NTP 서버 IP","description":""},"spanish":{"name":"NTP Server IP","description":""},"french":{"name":"NTP Server IP","description":""},"portuguese":{"name":"NTP Server IP","description":""},"italian":{"name":"NTP Server IP","description":""},"german":{"name":"NTP Server IP","description":""},"turkish":{"name":"NTP Server IP","description":""}},"children":[],"@labels":["IP"]},"EtherExtPorts":{"@translations":{"english":{"name":"External Ethernet Ports","description":""},"korean":{"name":"외부 이터넷 포트","description":""},"spanish":{"name":"External Ethernet Ports","description":""},"french":{"name":"External Ethernet Ports","description":""},"portuguese":{"name":"External Ethernet Ports","description":""},"italian":{"name":"External Ethernet Ports","description":""},"german":{"name":"External Ethernet Ports","description":""},"turkish":{"name":"External Ethernet Ports","description":""}},"children":[],"@labels":["IP"]},"DaylightSavings":{"@translations":{"english":{"name":"Daylight Savings","description":""},"korean":{"name":"일광절약제","description":""},"spanish":{"name":"Daylight Savings","description":""},"french":{"name":"Daylight Savings","description":""},"portuguese":{"name":"Daylight Savings","description":""},"italian":{"name":"Daylight Savings","description":""},"german":{"name":"Daylight Savings","description":""},"turkish":{"name":"Daylight Savings","description":""}},"children":[],"@labels":["IP"]},"SigModeCombined":{"@translations":{"english":{"name":"Signal Combine Mode","description":""},"korean":{"name":"Signal Combine Mode","description":""},"spanish":{"name":"Signal Combine Mode","description":""},"french":{"name":"Signal Combine Mode","description":""},"portuguese":{"name":"Signal Combine Mode","description":""},"italian":{"name":"Signal Combine Mode","description":""},"german":{"name":"Signal Combine Mode","description":""},"turkish":{"name":"Signal Combine Mode","description":""}},"children":[],"@labels":["Language"]}},"@netpollsmap":{"NET_POLL_PROTOCOL_VERSION":{"@translations":{"english":{"name":"Version"},"korean":{"name":""},"spanish":{"name":"Versión Protocolo"},"french":{"name":"Version"},"portuguese":{"name":""},"italian":{"name":"Versione"},"german":{"name":"Version"},"turkish":{"name":"Version"}}},"NET_POLL_KEY_CLASS_MASK":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""},"french":{"name":""},"portuguese":{"name":""},"italian":{"name":""},"german":{"name":""},"turkish":{"name":""}}},"NET_POLL_PROD_REC_VAR":{"@translations":{"english":{"name":"Settings - Product"},"korean":{"name":"Settings - Product"},"spanish":{"name":"Registro Producto"},"french":{"name":"Configuration - Produit"},"portuguese":{"name":""},"italian":{"name":"Registro Prodotto"},"german":{"name":"Produkteinstellungen"},"turkish":{"name":"Settings - Product"}}},"NET_POLL_PROD_SYS_VAR":{"@translations":{"english":{"name":"Settings - System"},"korean":{"name":"Settings - Product"},"spanish":{"name":"Registro Sistema"},"french":{"name":"Configuration - Produit"},"portuguese":{"name":""},"italian":{"name":"Registro Sistema"},"german":{"name":"Systemeinstellungen"},"turkish":{"name":"Settings - System"}}},"NET_POLL_REJECT":{"@translations":{"english":{"name":"Reject"},"korean":{"name":""},"spanish":{"name":"Rechazo"},"french":{"name":"Rejet"},"portuguese":{"name":""},"italian":{"name":"Rifiuto"},"german":{"name":"Auswurf"},"turkish":{"name":"Reject"}}},"NET_POLL_REJECT2":{"@translations":{"english":{"name":"Reject 2"},"korean":{"name":""},"spanish":{"name":"Rechazo 2"},"french":{"name":"Rejet 2"},"portuguese":{"name":""},"italian":{"name":"Rifiuto 2"},"german":{"name":"Auswurf 2"},"turkish":{"name":"Reject 2"}}},"NET_POLL_REJ_CNT":{"@translations":{"english":{"name":"Reject Count"},"korean":{"name":""},"spanish":{"name":"Cuenta Rechazos"},"french":{"name":"Nombre de Rejet"},"portuguese":{"name":""},"italian":{"name":"Contatore Rifiuti"},"german":{"name":"Auswurf-Zähler"},"turkish":{"name":"Reject Count"}}},"NET_POLL_FAULT":{"@translations":{"english":{"name":"Fault"},"korean":{"name":""},"spanish":{"name":"Fallo"},"french":{"name":"Défaillance/Erreur"},"portuguese":{"name":""},"italian":{"name":"Errore"},"german":{"name":"Fehler"},"turkish":{"name":"Fault"}}},"NET_POLL_RETEST":{"@translations":{"english":{"name":"Re-test"},"korean":{"name":""},"spanish":{"name":"Re-test"},"french":{"name":"Re-Tester"},"portuguese":{"name":""},"italian":{"name":"Re-test"},"german":{"name":"Re-test"},"turkish":{"name":"Re-test"}}},"NET_POLL_CONTROL":{"@translations":{"english":{"name":"Control"},"korean":{"name":""},"spanish":{"name":"Control"},"french":{"name":"Contrôle"},"portuguese":{"name":""},"italian":{"name":"Controllo"},"german":{"name":"Kontrolle"},"turkish":{"name":"Control"}}},"NET_POLL_POWERUP":{"@translations":{"english":{"name":"Power Up"},"korean":{"name":""},"spanish":{"name":"Arranque"},"french":{"name":"Mise sous Tension"},"portuguese":{"name":""},"italian":{"name":"Iniziare"},"german":{"name":"Einschalten"},"turkish":{"name":"Power Up"}}},"NET_POLL_OPERATOR_NO":{"@translations":{"english":{"name":"Operator Number"},"korean":{"name":""},"spanish":{"name":"Número Operador"},"french":{"name":"Numéro Opérateur"},"portuguese":{"name":""},"italian":{"name":"Numero Operatore"},"german":{"name":"Benutzer Nummer"},"turkish":{"name":"Operator Number"}}},"NET_POLL_TEST_REQ_PASS":{"@translations":{"english":{"name":"Test Request Pass"},"korean":{"name":""},"spanish":{"name":"Solicitud Test Aprobada"},"french":{"name":"Requête de Test Passe"},"portuguese":{"name":""},"italian":{"name":"Richiesta Test Superato"},"german":{"name":"Testanforderung bestanden"},"turkish":{"name":"Test Request Pass"}}},"NET_POLL_REJECT_ID":{"@translations":{"english":{"name":"Reject ID"},"korean":{"name":""},"spanish":{"name":"Identificación Rechazo"},"french":{"name":"ID Rejet"},"portuguese":{"name":""},"italian":{"name":"ID Rifiuto"},"german":{"name":"Auswurf ID"},"turkish":{"name":"Reject ID"}}},"NET_POLL_REJECT_CLEAR":{"@translations":{"english":{"name":"Reject Clear"},"korean":{"name":""},"spanish":{"name":"Borrado Rechazo"},"french":{"name":"Effacer Rejet"},"portuguese":{"name":""},"italian":{"name":"Cancellazione Rifiuto"},"german":{"name":"Auswurf löschen"},"turkish":{"name":"Reject Clear"}}},"NET_POLL_EYE_PROD_PEAK":{"@translations":{"english":{"name":"Product Signal Peak"},"korean":{"name":""},"spanish":{"name":"Señal Producto"},"french":{"name":"Signal Maximal du Produit"},"portuguese":{"name":""},"italian":{"name":"Picco Segnale Prodotto"},"german":{"name":"Produktsignal Peak"},"turkish":{"name":"Product Signal Peak"}}},"NET_POLL_EYE_PROD_PHASE":{"@translations":{"english":{"name":"Eye Product Phase"},"korean":{"name":""},"spanish":{"name":"Fase Producto"},"french":{"name":"Phase Produit Capteur Optique"},"portuguese":{"name":""},"italian":{"name":"Fase Prodotto Fotocellula"},"german":{"name":"Lichtschranke Produkt-Phase"},"turkish":{"name":"Eye Product Phase"}}},"NET_POLL_FAULT_CLEAR":{"@translations":{"english":{"name":"Clear Fault"},"korean":{"name":""},"spanish":{"name":"Fallo Borrado"},"french":{"name":"Effacer Défaillance/Erreur"},"portuguese":{"name":""},"italian":{"name":"Cancella Errore"},"german":{"name":"Fehler löschen"},"turkish":{"name":"Clear Fault"}}},"NET_POLL_SYNC_MENU":{"@translations":{"english":{"name":"Sync Menu"},"korean":{"name":""},"spanish":{"name":"Menú Sincronización"},"french":{"name":"Menu Sync"},"portuguese":{"name":""},"italian":{"name":"Sync Menu"},"german":{"name":"Sync. Menü"},"turkish":{"name":"Sync Menu"}}},"NET_POLL_PWD_ENTRY_1":{"@translations":{"english":{"name":"Password Entry 1"},"korean":{"name":""},"spanish":{"name":"Entrada Password 1"},"french":{"name":"Mot de Passe Entrée 1"},"portuguese":{"name":""},"italian":{"name":"Inserimento Password 1"},"german":{"name":"Passworteingabe 1"},"turkish":{"name":"Password Entry 1"}}},"NET_POLL_PWD_ENTRY_2":{"@translations":{"english":{"name":"Password Entry 2"},"korean":{"name":""},"spanish":{"name":"Entrada Password 2"},"french":{"name":"Mot de Passe Entrée 2"},"portuguese":{"name":""},"italian":{"name":"Inserimento Password 2"},"german":{"name":"Passworteingabe 2"},"turkish":{"name":"Password Entry 2"}}},"NET_POLL_SEL_UNIT":{"@translations":{"english":{"name":"Select Unit"},"korean":{"name":""},"spanish":{"name":"Seleccionar Unidad"},"french":{"name":"Sélectionner l'Unité"},"portuguese":{"name":""},"italian":{"name":"Seleziona Unità"},"german":{"name":"Einheit wählen"},"turkish":{"name":"Select Unit"}}},"NET_POLL_RESERVED":{"@translations":{"english":{"name":"Reserved"},"korean":{"name":""},"spanish":{"name":"Reservado"},"french":{"name":"Réservé"},"portuguese":{"name":""},"italian":{"name":"Riservato"},"german":{"name":"Reserved"},"turkish":{"name":"Reserved"}}},"NET_POLL_CLEAR_SCOPE":{"@translations":{"english":{"name":"Clear Scope"},"korean":{"name":""},"spanish":{"name":"Borrar Scope"},"french":{"name":"Effacer Champ"},"portuguese":{"name":""},"italian":{"name":"Cancella Scope"},"german":{"name":"Anzeige löschen"},"turkish":{"name":"Clear Scope"}}},"NET_POLL_REJECT_PHASE":{"@translations":{"english":{"name":"Reject Phase"},"korean":{"name":""},"spanish":{"name":"Rechazo Fase"},"french":{"name":"Phase Rejet"},"portuguese":{"name":""},"italian":{"name":"Fase Rifiuto"},"german":{"name":"Auswurf Phase"},"turkish":{"name":"Reject Phase"}}},"NET_POLL_FLASH_WRITE":{"@translations":{"english":{"name":"Flash Write"},"korean":{"name":""},"spanish":{"name":"Escritura Flash"},"french":{"name":"Clignotant Blanc"},"portuguese":{"name":""},"italian":{"name":"Scrivere Flash"},"german":{"name":"Flash beschreiben"},"turkish":{"name":"Flash Write"}}},"NET_POLL_INTCPTR_SWITCH":{"@translations":{"english":{"name":"Interceptor Switch"},"korean":{"name":""},"spanish":{"name":"Conmutación Interceptor"},"french":{"name":"Commutateur d'Intercepteur"},"portuguese":{"name":""},"italian":{"name":"Scambio Interceptor"},"german":{"name":"Interceptor Schalter"},"turkish":{"name":"Interceptor Switch"}}},"NET_POLL_PREC_DELETE":{"@translations":{"english":{"name":"Product Record Delete"},"korean":{"name":""},"spanish":{"name":"Eliminar Registro Producto"},"french":{"name":" Effacer Enregistrement Produit "},"portuguese":{"name":""},"italian":{"name":"Elimina Registro Prodotto"},"german":{"name":"Produktauzeichnung löschen"},"turkish":{"name":"Product Record Delete"}}},"NET_POLL_PREC_DEL_ALL":{"@translations":{"english":{"name":"Product Records Delete All"},"korean":{"name":""},"spanish":{"name":"Eliminar Todo Registro Producto"},"french":{"name":"Effacer Tous les Enregistrement Produit"},"portuguese":{"name":""},"italian":{"name":"Elimina Tutti Registri Prodotto"},"german":{"name":"Produktauzeichnung alles löschen"},"turkish":{"name":"Product Records Delete All"}}},"NET_POLL_PREC_BACKUP_SAVE":{"@translations":{"english":{"name":"Product Record Backup Save"},"korean":{"name":""},"spanish":{"name":"Guardar Copia Registro Producto"},"french":{"name":"Sauvegarde de l'Enregistrement Produit Sauvegardée"},"portuguese":{"name":""},"italian":{"name":"Backup Registro Prodotto"},"german":{"name":"Produktaufzeichnung Backup speichern"},"turkish":{"name":"Product Record Backup Save"}}},"NET_POLL_PREC_BACKUP_RESTORE":{"@translations":{"english":{"name":"Product Record Restore"},"korean":{"name":""},"spanish":{"name":"Restaurar Registro Producto"},"french":{"name":"Rétablir Enregistrement de Produit "},"portuguese":{"name":""},"italian":{"name":"Ripristina Registro Prodotto"},"german":{"name":"Produktaufzeichnung wieder herstellen"},"turkish":{"name":"Product Record Restore"}}},"NET_POLL_PREC_DEAULTS":{"@translations":{"english":{"name":"Product Record Defaults"},"korean":{"name":""},"spanish":{"name":"Registro Producto Defecto"},"french":{"name":"Enregistrement Défaillance/Erreur Produit"},"portuguese":{"name":""},"italian":{"name":"Registro Prodotto Predefinito"},"german":{"name":"Produktaufzeichnung Grundwerte"},"turkish":{"name":"Product Record Defaults"}}},"NET_POLL_PREC_COPY":{"@translations":{"english":{"name":"Product Record Copy"},"korean":{"name":""},"spanish":{"name":"Copiar Registro Producto"},"french":{"name":"Copier l'enregistrement de Produit"},"portuguese":{"name":""},"italian":{"name":"Copia Registro Prodotto"},"german":{"name":"Produktaufzeichnung kopieren"},"turkish":{"name":"Product Record Copy"}}},"NET_POLL_REJECT2_ID":{"@translations":{"english":{"name":"Reject 2 ID"},"korean":{"name":""},"spanish":{"name":"Identificación Rechazo 2"},"french":{"name":"ID Rejet 2"},"portuguese":{"name":""},"italian":{"name":"ID Rifiuto 2"},"german":{"name":"Auswurf 2 ID"},"turkish":{"name":"Reject 2 ID"}}},"NET_POLL_REJECT2_CLEAR":{"@translations":{"english":{"name":"Reject 2 Clear"},"korean":{"name":""},"spanish":{"name":"Borrar Rechazo 2"},"french":{"name":"Effacer Rejet 2"},"portuguese":{"name":""},"italian":{"name":"Cancella Rifiuto 2"},"german":{"name":"Auswurf 2 löschen"},"turkish":{"name":"Reject 2 Clear"}}},"NET_POLL_MANUAL_REJECT":{"@translations":{"english":{"name":"Manual Reject"},"korean":{"name":""},"spanish":{"name":"Rechazo Manual"},"french":{"name":"Rejet Manuel"},"portuguese":{"name":""},"italian":{"name":"Manual Reject"},"german":{"name":"Manueller Auswurf"},"turkish":{"name":"Manual Reject"}}},"NET_POLL_STREAM_EVENT":{"@translations":{"english":{"name":"Stream Event"},"korean":{"name":"Stream Event"},"spanish":{"name":"Stream Event"},"french":{"name":"Stream Event"},"portuguese":{"name":"Stream Event"},"italian":{"name":"Stream Event"},"german":{"name":"..Übertragung"},"turkish":{"name":"Stream Event"}}},"NETPOLL_STREAM_FRAM":{"@translations":{"english":{"name":"Stream FRAM"},"korean":{"name":"Stream FRAM"},"spanish":{"name":"Stream FRAM"},"french":{"name":"Stream FRAM"},"portuguese":{"name":"Stream FRAM"},"italian":{"name":"Stream FRAM"},"german":{"name":"Übertragung FRAM"},"turkish":{"name":"Stream FRAM"}}},"NETPOLL_STREAM_FAULTS_CLEAR":{"@translations":{"english":{"name":"Faults Clear"},"korean":{"name":"Faults Clear"},"spanish":{"name":"Faults Clear"},"french":{"name":"Effacer Défaillances/Erreur"},"portuguese":{"name":"Faults Clear"},"italian":{"name":"Faults Clear"},"german":{"name":"Fehler löschen"},"turkish":{"name":"Faults Clear"}}},"NETPOLL_STREAM_REJECT_CLEAR":{"@translations":{"english":{"name":"Reject Clear"},"korean":{"name":"Reject Clear"},"spanish":{"name":"Reject Clear"},"french":{"name":"Effacer Rejet"},"portuguese":{"name":"Reject Clear"},"italian":{"name":"Reject Clear"},"german":{"name":"Reject Clear"},"turkish":{"name":"Reject Clear"}}},"NETPOLL_STREAM_TEST_START":{"@translations":{"english":{"name":"Test Start"},"korean":{"name":"Test Start"},"spanish":{"name":"Test Start"},"french":{"name":"Débuter Test"},"portuguese":{"name":"Test Start"},"italian":{"name":"Test Start"},"german":{"name":"Teststart"},"turkish":{"name":"Test Start"}}},"NETPOLL_STREAM_TEST_END":{"@translations":{"english":{"name":"Test End"},"korean":{"name":"Test End"},"spanish":{"name":"Test End"},"french":{"name":"Terminer Test"},"portuguese":{"name":"Test End"},"italian":{"name":"Test End"},"german":{"name":"Test End"},"turkish":{"name":"Test End"}}},"NETPOLL_STREAM_FAULTS":{"@translations":{"english":{"name":"Fault"},"korean":{"name":"Fault"},"spanish":{"name":"Fault"},"french":{"name":"Défaillance/Erreur"},"portuguese":{"name":"Fault"},"italian":{"name":"Fault"},"german":{"name":"Fehler"},"turkish":{"name":"Fault"}}},"NET_POLL_TEST_STARTED":{"@translations":{"english":{"name":"Test Started"},"korean":{"name":"Test Started"},"spanish":{"name":"Test Started"},"french":{"name":"Test Débuté"},"portuguese":{"name":"Test Started"},"italian":{"name":"Test Started"},"german":{"name":"Test gestartet"},"turkish":{"name":"Test Started"}}},"NETPOLL_STREAM_LOGIN":{"@translations":{"english":{"name":"Logged In"},"korean":{"name":"로그인"},"spanish":{"name":"Logged In"},"french":{"name":"Connecté"},"portuguese":{"name":"Logged In"},"italian":{"name":"Logged In"},"german":{"name":"Eingeloggt"},"turkish":{"name":"Logged In"}}},"NETPOLL_STREAM_LOGOUT":{"@translations":{"english":{"name":"Logged Out"},"korean":{"name":"로그아웃"},"spanish":{"name":"Logged Out"},"french":{"name":"Déconnecté"},"portuguese":{"name":"Logged Out"},"italian":{"name":"Logged Out"},"german":{"name":"Ausgeloggt"},"turkish":{"name":"Logged Out"}}},"NETPOLL_STREAM_LOG_OUT":{"@translations":{"english":{"name":"Logged Out"},"korean":{"name":"로그아웃"},"spanish":{"name":"Logged Out"},"french":{"name":"Déconnecté"},"portuguese":{"name":"Logged Out"},"italian":{"name":"Logged Out"},"german":{"name":"Ausgeloggt"},"turkish":{"name":"Logged Out"}}},"NETPOLL_STREAM_REJECT":{"@translations":{"english":{"name":"Reject"},"korean":{"name":"리젝트"},"spanish":{"name":"Reject"},"french":{"name":"Rejet"},"portuguese":{"name":"Reject"},"italian":{"name":"Reject"},"german":{"name":"Auswurf"},"turkish":{"name":"Reject"}}},"NETPOLL_STREAM_INTERCEPTOR_REJECT":{"@translations":{"english":{"name":"Reject"},"korean":{"name":"리젝트"},"spanish":{"name":"Reject"},"french":{"name":"Rejet"},"portuguese":{"name":"Reject"},"italian":{"name":"Reject"},"german":{"name":"Auswurf"},"turkish":{"name":"Reject"}}}},"@pages":{"Sens":{"acc":2,"cat":"Sens","params":[{"type":0,"val":"Sens_A","acc":0},{"type":1,"val":{"child":0,"cat":"Detection Mode","params":[{"type":0,"val":"DetMode_A","acc":0},{"type":0,"val":"SigModeCombined","acc":0}]},"acc":0},{"type":1,"val":{"child":0,"cat":"Thresholds","params":[{"type":0,"val":"DetThresh","acc":0},{"type":0,"val":"DetThresh_A","acc":0},{"type":0,"val":"DetThEst","acc":0},{"type":0,"val":"DetThEst_A","acc":0},{"type":0,"val":"ThresProdHi_A","acc":0},{"type":0,"val":"BigMetThres_A","acc":0}]},"acc":0},{"type":1,"val":{"child":2,"cat":"Filter","params":[{"type":0,"val":"NoiseR_A","acc":0},{"type":0,"val":"NoiseX_A","acc":0},{"type":0,"val":"FilterNoise_A","acc":0}]},"acc":0},{"type":1,"val":{"child":0,"cat":"Oscillation Power","params":[{"type":0,"val":"OscPower_A","acc":0}]},"acc":0},{"type":1,"val":{"child":0,"cat":"FM Setup","params":[{"type":0,"val":"FmInput_A","acc":0}]},"acc":0},{"type":0,"val":"NoiseR_A","acc":0},{"type":0,"val":"NoiseX_A","acc":0}]},"Test":{"acc":0,"cat":"Test","params":[{"type":1,"val":{"cat":"Manual","params":[{"type":0,"val":"TestConfigCount0_0","acc":0},{"type":0,"val":"TestConfigCount0_1","acc":0},{"type":0,"val":"TestConfigCount0_2","acc":0},{"type":0,"val":"TestConfigCount0_3","acc":0},{"type":0,"val":"TestConfigCount0_4","acc":0},{"type":0,"val":"TestConfigCount0_5","acc":0},{"type":0,"val":"TestConfigAck0","acc":0},{"type":0,"val":"TestConfigOperator0","acc":0}]},"acc":0},{"type":1,"val":{"cat":"Manual2","params":[{"type":0,"val":"TestConfigCount2_0","acc":0},{"type":0,"val":"TestConfigCount2_1","acc":0},{"type":0,"val":"TestConfigCount2_2","acc":0},{"type":0,"val":"TestConfigCount2_3","acc":0},{"type":0,"val":"TestConfigCount2_4","acc":0},{"type":0,"val":"TestConfigCount2_5","acc":0},{"type":0,"val":"TestConfigAck2","acc":0},{"type":0,"val":"TestConfigOperator2","acc":0}]},"acc":0},{"type":1,"val":{"cat":"Halo","params":[{"type":0,"val":"TestConfigCount1_0","acc":0},{"type":0,"val":"TestConfigCount1_1","acc":0},{"type":0,"val":"TestConfigCount1_2","acc":0},{"type":0,"val":"TestConfigCount1_3","acc":0},{"type":0,"val":"TestConfigCount1_4","acc":0},{"type":0,"val":"TestConfigCount1_5","acc":0},{"type":0,"val":"TestConfigAck1","acc":0},{"type":0,"val":"TestConfigOperator1","acc":0},{"type":0,"val":"TestConfigHaloMode1","acc":0}]},"acc":0},{"type":1,"val":{"cat":"Halo2","params":[{"type":0,"val":"TestConfigCount3_0","acc":0},{"type":0,"val":"TestConfigCount3_1","acc":0},{"type":0,"val":"TestConfigCount3_2","acc":0},{"type":0,"val":"TestConfigCount3_3","acc":0},{"type":0,"val":"TestConfigCount3_4","acc":0},{"type":0,"val":"TestConfigCount3_5","acc":0},{"type":0,"val":"TestConfigAck3","acc":0},{"type":0,"val":"TestConfigOperator3","acc":0},{"type":0,"val":"TestConfigHaloMode3","acc":0}]},"acc":0},{"type":1,"val":{"cat":"HaloConf","params":[{"type":0,"val":"HaloBoard","acc":0},{"type":0,"val":"HaloPeakRFe_A","acc":0},{"type":0,"val":"HaloPeakRFe_B","acc":0},{"type":0,"val":"HaloPeakRNFe_A","acc":0},{"type":0,"val":"HaloPeakRNFe_B","acc":0},{"type":0,"val":"HaloPeakRSs_A","acc":0},{"type":0,"val":"HaloPeakRSs_B","acc":0},{"type":0,"val":"HaloCal","acc":0}]},"acc":0},{"type":0,"val":"TestTime","acc":0},{"type":0,"val":"TestDeferTime","acc":0},{"type":0,"val":"TestMode","acc":0},{"type":0,"val":"TestBlockReject","acc":0}]},"Calibration":{"acc":0,"cat":"Calibration","params":[{"type":1,"val":{"cat":"Learn Path","params":[{"type":0,"val":"LearnPhase_A","acc":0},{"type":0,"val":"LearnSens_A","acc":0}]},"acc":0},{"type":1,"val":{"cat":"Phase","params":[{"type":1,"val":{"cat":"MPhase","params":[{"type":0,"val":"MPhaseOrder_A","acc":0},{"type":0,"val":"MPhaseDD_A","acc":0},{"type":0,"val":"MPhaseRD_A","acc":0}]},"acc":0},{"type":0,"val":"PhaseAngleAuto_A","acc":0},{"type":0,"val":"PhaseMode_A","acc":0},{"type":0,"val":"PhaseSpeed_A","acc":0},{"type":0,"val":"PhaseModeHold_A","acc":0},{"type":0,"val":"PhaseLimitDry_A","acc":0},{"type":0,"val":"PhaseLimitDrySpread_A","acc":0},{"type":0,"val":"PhaseLimitWet_A","acc":0},{"type":0,"val":"PhaseLimitWetSpread_A","acc":0},{"type":0,"val":"PhaseOffset_A","acc":0},{"type":0,"val":"PhaseTrigThres","acc":0},{"type":0,"val":"PhaseTrigLimit","acc":0},{"type":0,"val":"AutoPhasePacks","acc":0}]},"acc":0},{"type":0,"val":"ExpectedSig_A","acc":0},{"type":0,"val":"SensMax_A","acc":0},{"type":0,"val":"SensMin_A","acc":0}]}},"@catmap":{"Reject":{"@translations":{"english":"Reject","korean":"거부","spanish":"Rechazo","french":"Rejet","portuguese":"Reject","italian":"Rifiuto","german":"Auswurf","turkish":"Reject"}},"Password":{"@translations":{"english":"Password","korean":"암호","spanish":"Contraseña","french":"Mot de Passe","portuguese":"Password","italian":"Password","german":"Passwort","turkish":"Password"}},"IO":{"@translations":{"english":"I/O","korean":"입출력","spanish":"I/O","french":"I/O","portuguese":"I/O","italian":"I/O","german":"I/O","turkish":"I/O"}},"System":{"@translations":{"english":"System","korean":"시스템","spanish":"Sistema","french":"Système","portuguese":"System","italian":"Sistema","german":"System","turkish":"System"}},"Fault":{"@translations":{"english":"Faults","korean":"오류","spanish":"Fallos","french":"Défaillances/Erreurs","portuguese":"Faults","italian":"Errori","german":"Fehler","turkish":"Faults"}},"System/FRAM":{"@translations":{"english":"Communication Settings","korean":"네트워크 설정","spanish":"Communication Settings","french":"Paramètres Réseau","portuguese":"Communication Settings","italian":"Impostazioni Rete","german":"Netzwerkeinstellungen","turkish":"Communication Settings"}},"System/About":{"@translations":{"english":"Technical Information","korean":"Technical Information","spanish":"Technical Information","french":"Technical Information","portuguese":"Technical Information","italian":"Technical Information","german":"Technical Information","turkish":"Technical Information"}},"System/SysVersion":{"@translations":{"english":"System Record Date","korean":"System Record Date","spanish":"System Record Date","french":"SYstème Enregistrement Date","portuguese":"System Record Date","italian":"System Record Date","german":"Systemaufzeichnungsdatum","turkish":"System Record Date"}},"System/Passwords":{"@translations":{"english":"Passwords","korean":"Passwords","spanish":"Passwords","french":"Mots de Passe","portuguese":"Passwords","italian":"Passwords","german":"Passworte","turkish":"Passwords"}},"System/FRAM/IO Board Settings":{"@translations":{"english":"IO Board Settings","korean":"IO Board 설정","spanish":"IO Board Settings","french":"Panneau Configuration IO","portuguese":"IO Board Settings","italian":"Impostazioni Scheda IO","german":"IO-Karte Einstellungen","turkish":"IO Board Settings"}},"System/FRAM/Detector IP":{"@translations":{"english":"Detector Addresses","korean":"Detector Addresses","spanish":"Detector Addresses","french":"Adresses Détecteur","portuguese":"Detector Addresses","italian":"Indirizzi Detector","german":"Detektor Adressen","turkish":"Detector Addresses"}},"System/FRAM/Halo Board Settings":{"@translations":{"english":"Halo Board Settings","korean":"Halo Board 설정","spanish":"Halo Board Settings","french":"Panneau Configuration Halo","portuguese":"Halo Board Settings","italian":"Impostazioni Scheda Halo","german":"Halo-Karten Einstellungen","turkish":"Halo Board Settings"}},"System/FRAM/Display Settings":{"@translations":{"english":"Display Settings","korean":"Display 설정","spanish":"Display Settings","french":"Affichage Paramètres","portuguese":"Display Settings","italian":"Impostazioni Schermo","german":"Display Einstellungen","turkish":"Display Settings"}},"Reject/Additional Settings":{"@translations":{"english":"Additional Settings","korean":"추가 설정","spanish":"Ajustes Adicionales","french":"Paramètres Additionnels","portuguese":"Additional Settings","italian":"Altre Impostazioni","german":"zusätzliche Einstellungen","turkish":"Additional Settings"}},"Reject/Additional Settings/Distances":{"@translations":{"english":"Distances","korean":"거리","spanish":"Distancias","french":"Distances","portuguese":"Distances","italian":"Distanze","german":"Distanzen","turkish":"Distances"}},"Reject/Additional Settings/Belt Speed":{"@translations":{"english":"Belt Speed","korean":"벨트 속도","spanish":"Velocidad de Cinta","french":"Vitesse Courroie","portuguese":"Belt Speed","italian":"Velocità Nastro Trasportatore","german":"Bandgeschwindigkeit","turkish":"Belt Speed"}},"Reject/Additional Settings/Latch":{"@translations":{"english":"Latches","korean":"래치","spanish":"Retenciones","french":"Verrous","portuguese":"Latches","italian":"Mantenimento","german":"Selbsthaltung","turkish":"Latches"}},"Reject/Additional Settings/Clocks":{"@translations":{"english":"Clocks","korean":"시계","spanish":"Relojes","french":"Horloges","portuguese":"Clocks","italian":"Orologi","german":"Uhren","turkish":"Clocks"}},"IO/Inputs":{"@translations":{"english":"Inputs","korean":"입력","spanish":"Entradas","french":"Entrées","portuguese":"Inputs","italian":"Ingressi","german":"Eingänge","turkish":"Inputs"}},"IO/Outputs":{"@translations":{"english":"Outputs","korean":"출력","spanish":"Salidas","french":"Sorties","portuguese":"Outputs","italian":"Uscite","german":"Ausgänge","turkish":"Outputs"}},"Sens":{"@translations":{"english":"Sensitivity","korean":"민감도","spanish":"Sensibilidad","french":"Sensitivité","portuguese":"Sensitivity","italian":"Sensibilità","german":"Empfindlichkeit","turkish":"Sensitivity"}},"Test":{"@translations":{"english":"Test","korean":"테스트","spanish":"Test","french":"Test","portuguese":"Test","italian":"Test","german":"Test","turkish":"Test"}},"Test/Manual":{"@translations":{"english":"Manual Test 1","korean":"수동 테스트 1","spanish":"Test Manual 1","french":"Test Manuel 1","portuguese":"Manual Test 1","italian":"Test Manuale 1","german":"Manueller Test 1","turkish":"Manual Test 1"}},"Test/Halo":{"@translations":{"english":"Halo Test 1","korean":"헤일로 테스트 1","spanish":"Test Halo 1","french":"Test Halo 1","portuguese":"Halo Test 1","italian":"Test Halo 1","german":"Halo Test 1","turkish":"Halo Test 1"}},"Test/Manual2":{"@translations":{"english":"Manual Test 2","korean":"수동 테스트 2","spanish":"Test Manual 2","french":"Test Manuel 2","portuguese":"Manual Test 2","italian":"Test Manuale 2","german":"Manueller Test 2","turkish":"Manual Test 2"}},"Test/Halo2":{"@translations":{"english":"Halo Test 2","korean":"헤일로 테스트 2","spanish":"Test Halo 2","french":"Test Halo 2","portuguese":"Halo Test 2","italian":"Test Halo 2","german":"Halo Test 2","turkish":"Halo Test 2"}},"Test/HaloConf":{"@translations":{"english":"Test Configuration","korean":"테스트 설정","spanish":"Configuración Test","french":"Configuration de Test","portuguese":"Test Configuration","italian":"Test Impostazioni","german":"Test Konfiguration","turkish":"Test Configuration"}},"Sens/Filter":{"@translations":{"english":"Filter Noise","korean":"필터 노이즈","spanish":"Filtro Ruido","french":"Filtre Bruit","portuguese":"Filter Noise","italian":"Filtro Rumore","german":"Filter Rauschen","turkish":"Filter Noise"}},"Sens/Oscillation Power":{"@translations":{"english":"Oscillator Power","korean":"오실레이션 파워","spanish":"Potencia Oscilación","french":"Puissance Oscilliateur","portuguese":"Oscillation Power","italian":"Potenza Oscillazione","german":"Oszillator Leistung","turkish":"Oscillator Power"}},"Sens/Detection Mode":{"@translations":{"english":"Detection Mode","korean":"검출방식","spanish":"Modo Detección","french":"Mode Détection","portuguese":"Modo de Detecção","italian":"Modo Rivelamento","german":"Detektions Modus","turkish":"Detection Mode"}},"Sens/FM Setup":{"@translations":{"english":"FM Setup","korean":"FM 설정","spanish":"Ajuste FM","french":"Configuration FM","portuguese":"FM Setup","italian":"Configurazione FM","german":"FM Setup","turkish":"FM Setup"}},"Sens/Thresholds":{"@translations":{"english":"Thresholds","korean":"Thresholds","spanish":"Thresholds","french":"Thresholds","portuguese":"Thresholds","italian":"Thresholds","german":"Thresholds","turkish":"Thresholds"}},"Calibration":{"@translations":{"english":"Learn","korean":"학습","spanish":"Learn","french":"Learn","portuguese":"Learn","italian":"Learn","german":"Learn","turkish":"Learn"}},"Calibration/Phase":{"@translations":{"english":"Phase","korean":"페이즈","spanish":"Fase","french":"Phase","portuguese":"Phase","italian":"Fase","german":"Phase","turkish":"Phase"}},"Calibration/Learn Path":{"@translations":{"english":"Learn Path","korean":"페이즈","spanish":"Fase","french":"Phase","portuguese":"Phase","italian":"Fase","german":"Phase","turkish":"Phase"}},"Calibration/Phase/MPhase":{"@translations":{"english":"M Phase","korean":"다중 페이즈","spanish":"Fase M","french":"Phase M","portuguese":"M Phase","italian":"Fase M","german":"M Phase","turkish":"M Phase"}},"System/SysVersion/MPhase":{"@translations":{"english":"Multiple Phase","korean":"다중 페이즈","spanish":"Fase Múltiple","french":"Phase Multiple","portuguese":"M Phase","italian":"Fase Multiple","german":"Multiple Phase","turkish":"Multiple Phase"}},"System/SysVersion/DCFilter":{"@translations":{"english":"DC Filter","korean":"DC Filter","spanish":"DC Filter","french":"Filtre DC","portuguese":"DC Filter","italian":"DC Filter","german":"DC Filter","turkish":"DC Filter"}}},"@languages":["english","korean","spanish","french","portuguese","italian","german","turkish"],"@labels":{"Channel A":{"english":{"name":"Channel A"},"korean":{"name":"채널 A"},"spanish":{"name":"Canal A"},"french":{"name":"Canal A"},"portuguese":{"name":"Canal A"},"italian":{"name":"Canale A"},"german":{"name":"A-Kanal"},"turkish":{"name":"Channel A"}},"Channel B":{"english":{"name":"Channel B"},"korean":{"name":"채널 B"},"spanish":{"name":"Canal B"},"french":{"name":"Canal B"},"portuguese":{"name":"Canal B"},"italian":{"name":"Canale B"},"german":{"name":"B-Kanal"},"turkish":{"name":"Channel B"}},"Mode":{"english":{"name":"Mode"},"korean":{"name":"모드"},"spanish":{"name":"Modo"},"french":{"name":"Mode"},"portuguese":{"name":"Modo"},"italian":{"name":"Modo"},"german":{"name":"Modus"},"turkish":{"name":"Mode"}},"Device":{"english":{"name":"Device"},"korean":{"name":"기기"},"spanish":{"name":"dispositivo"},"french":{"name":"appareil"},"portuguese":{"name":"dispositivo"},"italian":{"name":"dispositivo"},"german":{"name":"Gerät"},"turkish":{"name":"Device"}},"Count":{"english":{"name":"Count"},"korean":{"name":"횟수"},"spanish":{"name":"Cuenta"},"french":{"name":"Nombre"},"portuguese":{"name":"Quantidade"},"italian":{"name":"Contatore"},"german":{"name":"Zähler"},"turkish":{"name":"Count"}},"Year":{"english":{"name":"Year"},"korean":{"name":"년"},"spanish":{"name":"Year"},"french":{"name":"Year"},"portuguese":{"name":"Year"},"italian":{"name":"Year"},"german":{"name":"Year"},"turkish":{"name":"Year"}},"Month":{"english":{"name":"Month"},"korean":{"name":"월"},"spanish":{"name":"Month"},"french":{"name":"Month"},"portuguese":{"name":"Month"},"italian":{"name":"Month"},"german":{"name":"Month"},"turkish":{"name":"Month"}},"Day":{"english":{"name":"Day"},"korean":{"name":"일"},"spanish":{"name":"Day"},"french":{"name":"Day"},"portuguese":{"name":"Day"},"italian":{"name":"Day"},"german":{"name":"Day"},"turkish":{"name":"Day"}},"Hour":{"english":{"name":"Hour"},"korean":{"name":"시"},"spanish":{"name":"Hour"},"french":{"name":"Hour"},"portuguese":{"name":"Hour"},"italian":{"name":"Hour"},"german":{"name":"Hour"},"turkish":{"name":"Hour"}},"Minute":{"english":{"name":"Minute"},"korean":{"name":"분"},"spanish":{"name":"Minute"},"french":{"name":"Minute"},"portuguese":{"name":"Minute"},"italian":{"name":"Minute"},"german":{"name":"Minute"},"turkish":{"name":"Minute"}},"Second":{"english":{"name":"Second"},"korean":{"name":"초"},"spanish":{"name":"Second"},"french":{"name":"Second"},"portuguese":{"name":"Second"},"italian":{"name":"Second"},"german":{"name":"Second"},"turkish":{"name":"Second"}},"Metal Type":{"english":{"name":"Metal Type"},"korean":{"name":"금속 종류"},"spanish":{"name":"Tipo Metal"},"french":{"name":"Type de Métal"},"portuguese":{"name":"Tipo de Metal"},"italian":{"name":"Tipo Metallo"},"german":{"name":"Metallart"},"turkish":{"name":"Metal Type"}},"Signal Chain":{"english":{"name":"Signal Chain"},"korean":{"name":"시그널 체인"},"spanish":{"name":"Cadena Señal"},"french":{"name":"Chaîne signalétique"},"portuguese":{"name":"Cadeia de Sinal"},"italian":{"name":"Catene Segnale"},"german":{"name":"Signalkette"},"turkish":{"name":"Signal Chain"}},"Source":{"english":{"name":"Source"},"korean":{"name":"소스"},"spanish":{"name":"Fuente"},"french":{"name":"Source"},"portuguese":{"name":"Fonte"},"italian":{"name":"Sorgente"},"german":{"name":"Quelle"},"turkish":{"name":"Source"}},"Polarity":{"english":{"name":"Polarity"},"korean":{"name":"폴래리티"},"spanish":{"name":"Polaridad"},"french":{"name":"Polarité"},"portuguese":{"name":"Polaridade"},"italian":{"name":"Polarità"},"german":{"name":"Polarität"},"turkish":{"name":"Polarity"}},"Sensitivity":{"english":{"name":"Sensitivity"},"korean":{"name":"민감도"},"spanish":{"name":"Sensibildad"},"french":{"name":" Sensibilité"},"portuguese":{"name":"Sensibilidade"},"italian":{"name":"Sensibilità"},"german":{"name":"Empfindlichkeit"},"turkish":{"name":"Sensitivity"}},"Signal":{"english":{"name":"Signal"},"korean":{"name":"신호"},"spanish":{"name":"Señal"},"french":{"name":"Signal"},"portuguese":{"name":"Sinal"},"italian":{"name":"Segnale"},"german":{"name":"Signal"},"turkish":{"name":"Signal"}},"Rejects":{"english":{"name":"Rejects"},"korean":{"name":"거부"},"spanish":{"name":"Rechazo"},"french":{"name":"Rejets"},"portuguese":{"name":"Rejeção"},"italian":{"name":"Rifiuti"},"german":{"name":"Auswürfe"},"turkish":{"name":"Rejects"}},"Settings":{"english":{"name":"Settings"},"korean":{"name":"설정"},"spanish":{"name":"Ajustes"},"french":{"name":" Paramètres"},"portuguese":{"name":"Parâmetros"},"italian":{"name":"Impostazioni"},"german":{"name":"Einstellungen"},"turkish":{"name":"Settings"}},"Test":{"english":{"name":"Test"},"korean":{"name":"테스트"},"spanish":{"name":"Test"},"french":{"name":"Test"},"portuguese":{"name":"Teste"},"italian":{"name":"Test"},"german":{"name":"Test"},"turkish":{"name":"Test"}},"Back":{"english":{"name":"Back"},"korean":{"name":"뒤로"},"spanish":{"name":"volver"},"french":{"name":"retourner"},"portuguese":{"name":"regressar"},"italian":{"name":"ritornare"},"german":{"name":"zurückkehren"},"turkish":{"name":"Back"}},"Accept":{"english":{"name":"Accept"},"korean":{"name":"적용"},"spanish":{"name":"Aceptar"},"french":{"name":"Acceptez"},"portuguese":{"name":"aceitar"},"italian":{"name":"accettare"},"german":{"name":"akzeptieren"},"turkish":{"name":"Accept"}},"Cancel":{"english":{"name":"Cancel"},"korean":{"name":"취소"},"spanish":{"name":"Cancelar"},"french":{"name":"Annuler"},"portuguese":{"name":"Cancelar"},"italian":{"name":"Annulla"},"german":{"name":"Stornieren"},"turkish":{"name":"Cancel"}},"Test in progress":{"english":{"name":"Test in progress"},"korean":{"name":"테스트 진행 중"},"spanish":{"name":"Test en progreso"},"french":{"name":"Test en cours"},"portuguese":{"name":"Teste em andamento"},"italian":{"name":"Test in corso"},"german":{"name":"Test läuft"},"turkish":{"name":"Test in progress"}},"Test required":{"english":{"name":"Test required"},"korean":{"name":"테스트 필요"},"spanish":{"name":"Test requerida"},"french":{"name":"Test requis"},"portuguese":{"name":"Teste requerido"},"italian":{"name":"Test richiesto"},"german":{"name":"Test erforderlich"},"turkish":{"name":"Test required"}},"Clear Reject Latch":{"english":{"name":"Clear Reject Latch"},"korean":{"name":"리젝트 래치 클리어"},"spanish":{"name":"Claro rechazo de cierre"},"french":{"name":"Effacer le verrou de rejet"},"portuguese":{"name":"Trava de rejeição clara"},"italian":{"name":"Cancella chiavistello di rifiuto"},"german":{"name":"Löschen Sie die Zurückweisungssperre"},"turkish":{"name":"Clear Reject Latch"}},"Reject Latched":{"english":{"name":"Reject Latched"},"korean":{"name":"리젝트 래치됨"},"spanish":{"name":"Rechazar enganchado"},"french":{"name":"Rejeter verrouillé"},"portuguese":{"name":"Rejeitar travado"},"italian":{"name":"Rifiuta chiusa"},"german":{"name":"Abweisen verriegelt"},"turkish":{"name":"Reject Latched"}},"Please Wait":{"english":{"name":"Please Wait"},"korean":{"name":"기다려주세요"},"spanish":{"name":"por favor espera"},"french":{"name":"S'il vous plaît, attendez"},"portuguese":{"name":"Por favor, espere"},"italian":{"name":"attendere prego"},"german":{"name":"Warten Sie mal"},"turkish":{"name":"Please Wait"}},"Updating Detector":{"english":{"name":"Updating Detector"},"korean":{"name":"업데이트 진행중.."},"spanish":{"name":"Détecteur Mise à jour"},"french":{"name":"Détecteur Mise à jour"},"portuguese":{"name":"Atualizando Detector"},"italian":{"name":"Aggiornamento del rilevatore"},"german":{"name":"Aktualisierung des Detektors"},"turkish":{"name":"Updating Detector"}},"Clean mode":{"english":{"name":"Clean mode"},"korean":{"name":"청소 모드"},"spanish":{"name":"Modo limpio"},"french":{"name":"Mode propre"},"portuguese":{"name":"Modo de limpeza"},"italian":{"name":"Modalità pulita"},"german":{"name":"Reinigungsmodus"},"turkish":{"name":"Clean mode"}},"Time left":{"english":{"name":"Time left"},"korean":{"name":"남은 시간"},"spanish":{"name":"Tiempo restante"},"french":{"name":"Temps restant"},"portuguese":{"name":"Tempo restante"},"italian":{"name":"Tempo rimasto"},"german":{"name":"Übrige Zeit"},"turkish":{"name":"Time left"}},"Clear Latch":{"english":{"name":"Clear Latch"},"korean":{"name":"래치 클리어"},"spanish":{"name":"pestillo claro"},"french":{"name":"verrouiller clair"},"portuguese":{"name":"trava clara"},"italian":{"name":"Cancella chiavistello"},"german":{"name":"Löschen Sie die Verriegelung"},"turkish":{"name":"Clear Latch"}},"Tests":{"english":{"name":"Tests"},"korean":{"name":"테스트"},"spanish":{"name":"Tests"},"french":{"name":"Tests"},"portuguese":{"name":"Testes"},"italian":{"name":"Tests"},"german":{"name":"Tests"},"turkish":{"name":"Tests"}},"Log":{"english":{"name":"Log"},"korean":{"name":"기록"},"spanish":{"name":"Log"},"french":{"name":"Registre"},"portuguese":{"name":"Log"},"italian":{"name":"Log"},"german":{"name":"Log"},"turkish":{"name":"Log"}},"Calibrate":{"english":{"name":"Calibrate"},"korean":{"name":"조정"},"spanish":{"name":"Calibrar"},"french":{"name":"Calibrer"},"portuguese":{"name":"Calibrar"},"italian":{"name":"Calibrare"},"german":{"name":"Kalibrieren"},"turkish":{"name":"Calibrate"}},"Learn":{"english":{"name":"Learn"},"korean":{"name":"학습"},"spanish":{"name":"Learn"},"french":{"name":"Learn"},"portuguese":{"name":"Learn"},"italian":{"name":"Learn"},"german":{"name":"Learn"},"turkish":{"name":"Learn"}},"Product":{"english":{"name":"Product"},"korean":{"name":"품목"},"spanish":{"name":"Producto"},"french":{"name":"Produit"},"portuguese":{"name":"Produto"},"italian":{"name":"Prodotto"},"german":{"name":"Produkt"},"turkish":{"name":"Product"}},"Products":{"english":{"name":"Products"},"korean":{"name":"품목"},"spanish":{"name":"Productos"},"french":{"name":"Produits"},"portuguese":{"name":"Produtos"},"italian":{"name":"Prodotti"},"german":{"name":"Produkte"},"turkish":{"name":"Products"}},"Timestamp":{"english":{"name":"Timestamp"},"korean":{"name":"시간"},"spanish":{"name":"Marca Tiempo"},"french":{"name":"Horodatage"},"portuguese":{"name":"Marca de Horário"},"italian":{"name":"Marca Temporale"},"german":{"name":"Zeitstempel"},"turkish":{"name":"Timestamp"}},"Edit":{"english":{"name":"Edit"},"korean":{"name":"변경"},"spanish":{"name":"Edit"},"french":{"name":"Editer"},"portuguese":{"name":"Edit"},"italian":{"name":"Edit"},"german":{"name":"Editieren"},"turkish":{"name":"Edit"}},"Event":{"english":{"name":"Event"},"korean":{"name":"이벤트"},"spanish":{"name":"Event"},"french":{"name":"Activité"},"portuguese":{"name":"Event"},"italian":{"name":"Evento"},"german":{"name":"Event"},"turkish":{"name":"Event"}},"Events":{"english":{"name":"Events"},"korean":{"name":"이벤트"},"spanish":{"name":"Events"},"french":{"name":"Activités"},"portuguese":{"name":"Events"},"italian":{"name":"Eventos"},"german":{"name":"Ereignisse"},"turkish":{"name":"Events"}},"All":{"english":{"name":"All"},"korean":{"name":"전체"},"spanish":{"name":"Todos"},"french":{"name":"Tout"},"portuguese":{"name":"Todos"},"italian":{"name":"Tutti"},"german":{"name":"Alle"},"turkish":{"name":"All"}},"Details":{"english":{"name":"Details"},"korean":{"name":"세부사항"},"spanish":{"name":"Detalles"},"french":{"name":"Détails"},"portuguese":{"name":"Detalhes"},"italian":{"name":"Dettagli"},"german":{"name":"Details"},"turkish":{"name":"Details"}},"Description":{"english":{"name":"Description"},"korean":{"name":"세부사항"},"spanish":{"name":"Description"},"french":{"name":"Description"},"portuguese":{"name":"Description"},"italian":{"name":"Description"},"german":{"name":"Beschreibung"},"turkish":{"name":"Description"}},"Running Product":{"english":{"name":"Running Product"},"korean":{"name":"현 품목"},"spanish":{"name":"Producto en Ejecución"},"french":{"name":"Produit Courant"},"portuguese":{"name":"Produto Rodando"},"italian":{"name":"Prodotto in Esecuzione"},"german":{"name":"aktives Produkt"},"turkish":{"name":"Running Product"}},"Select Test":{"english":{"name":"Select Test"},"korean":{"name":"테스트 선택"},"spanish":{"name":"Selección Test"},"french":{"name":"Sélectionner le Test"},"portuguese":{"name":"Seleção de Teste"},"italian":{"name":"Seleziona Test"},"german":{"name":"Select Test"},"turkish":{"name":"Select Test"}},"Currently Running":{"english":{"name":"Currently Running"},"korean":{"name":"실행중"},"spanish":{"name":"Actualmente en Ejecución"},"french":{"name":"Présentement en exécution"},"portuguese":{"name":"Atualmente em Execução"},"italian":{"name":"Attualmente In Esecuzione"},"german":{"name":"momentan Aktiv"},"turkish":{"name":"Currently Running"}},"Quit Test":{"english":{"name":"Quit Test"},"korean":{"name":"테스트 중단"},"spanish":{"name":"Salir Test"},"french":{"name":"Abandonner le test"},"portuguese":{"name":"Sair do Teste"},"italian":{"name":"Esci Test"},"german":{"name":"Test abbrechen"},"turkish":{"name":"Quit Test"}},"activate":{"english":{"name":"activate"},"korean":{"name":"활성화"},"spanish":{"name":"Activar"},"french":{"name":"Activer"},"portuguese":{"name":"Ativar"},"italian":{"name":"Attivare"},"german":{"name":"aktiviere"},"turkish":{"name":"activate"}},"Clear Faults":{"english":{"name":"Clear Faults"},"korean":{"name":"폴트 클리어"},"spanish":{"name":"Borrar Fallos"},"french":{"name":"Effacer Défaillance/Erreur"},"portuguese":{"name":"Limpar Falhas"},"italian":{"name":"Cancella Errori"},"german":{"name":"Fehler löschen"},"turkish":{"name":"Clear Faults"}},"Clear Warnings":{"english":{"name":"Clear Warnings"},"korean":{"name":"경고 클리어"},"spanish":{"name":"Clear Warnings"},"french":{"name":"Clear Warnings"},"portuguese":{"name":"Clear Warnings"},"italian":{"name":"Clear Warnings"},"german":{"name":"Clear Warnings"},"turkish":{"name":"Clear Warnings"}},"No Faults":{"english":{"name":"No Faults"},"korean":{"name":"폴트 없음"},"spanish":{"name":"Sin Fallos"},"french":{"name":"Aucune Erreur"},"portuguese":{"name":"Sem Falhas"},"italian":{"name":"Nessun Errore"},"german":{"name":"keine Fehler"},"turkish":{"name":"No Faults"}},"Faults":{"english":{"name":"Faults"},"korean":{"name":"폴트"},"spanish":{"name":"Fallos"},"french":{"name":"Erreurs"},"portuguese":{"name":"Falhas"},"italian":{"name":"Errore"},"german":{"name":"Fehler"},"turkish":{"name":"Faults"}},"Fault":{"english":{"name":"Fault"},"korean":{"name":"폴트"},"spanish":{"name":"Fallo"},"french":{"name":"Erreur"},"portuguese":{"name":"Falha"},"italian":{"name":"Errore"},"german":{"name":"Fehler"},"turkish":{"name":"Fault"}},"Warnings":{"english":{"name":"Warnings"},"korean":{"name":"경고"},"spanish":{"name":"Advertencias"},"french":{"name":"Alerte"},"portuguese":{"name":"Avisos"},"italian":{"name":"Avvertenze"},"german":{"name":"Warnungen"},"turkish":{"name":"Warnings"}},"Warning":{"english":{"name":"Warning"},"korean":{"name":"경고"},"spanish":{"name":"Advertencia"},"french":{"name":"Alerte"},"portuguese":{"name":"Aviso"},"italian":{"name":"Avvertimento"},"german":{"name":"Warnung"},"turkish":{"name":"Warning"}},"Calibrate All":{"english":{"name":"Calibrate All"},"korean":{"name":"전부 조정"},"spanish":{"name":"Calibrar Todo"},"french":{"name":"Calibrer Tout"},"portuguese":{"name":"Calibrar Tudo"},"italian":{"name":"Calibra Tutto"},"german":{"name":"Kalibriere alles"},"turkish":{"name":"Calibrate All"}},"Detector":{"english":{"name":"Detector"},"korean":{"name":"디텍터"},"spanish":{"name":"Detector"},"french":{"name":"Détecteur"},"portuguese":{"name":"Detector"},"italian":{"name":"Detector"},"german":{"name":"Detektor"},"turkish":{"name":"Detector"}},"Summary of Events":{"english":{"name":"Summary of Events"},"korean":{"name":"개요"},"spanish":{"name":"Summary of Events"},"french":{"name":"Résumé des Activités"},"portuguese":{"name":"Summary of Events"},"italian":{"name":"Summary of Events"},"german":{"name":"Zusammenfassung Ereignisse"},"turkish":{"name":"Summary of Events"}},"Setting Changes":{"english":{"name":"Setting Changes"},"korean":{"name":"설정 변경"},"spanish":{"name":"Setting Changes"},"french":{"name":"Changements de Configuration"},"portuguese":{"name":"Setting Changes"},"italian":{"name":"Setting Changes"},"german":{"name":"Einstellungsänderungen"},"turkish":{"name":"Setting Changes"}},"Product Changes":{"english":{"name":"Product Changes"},"korean":{"name":"품목 변경"},"spanish":{"name":"Product Changes"},"french":{"name":"Changements de Produit"},"portuguese":{"name":"Product Changes"},"italian":{"name":"Product Changes"},"german":{"name":"Produktänderungen"},"turkish":{"name":"Product Changes"}},"Test Rejects":{"english":{"name":"Test Rejects"},"korean":{"name":"테스트 리젝트"},"spanish":{"name":"Test Rejects"},"french":{"name":"Tester les Rejets"},"portuguese":{"name":"Test Rejects"},"italian":{"name":"Test Rejects"},"german":{"name":"Teste Auswürfe"},"turkish":{"name":"Test Rejects"}},"Contact Information":{"english":{"name":"Contact Information"},"korean":{"name":"연락처"},"spanish":{"name":"Contact Information"},"french":{"name":"Coordonnées de Communication"},"portuguese":{"name":"Contact Information"},"italian":{"name":"Contact Information"},"german":{"name":"Kontakt Information"},"turkish":{"name":"Contact Information"}},"Report Filter":{"english":{"name":"Report Filter"},"korean":{"name":"리포트 필터"},"spanish":{"name":"Report Filter"},"french":{"name":"Filtre d'enregistrement"},"portuguese":{"name":"Report Filter"},"italian":{"name":"Report Filter"},"german":{"name":"Berichte Filter"},"turkish":{"name":"Report Filter"}},"Generated at":{"english":{"name":"Generated at"},"korean":{"name":"생성시간"},"spanish":{"name":"Generated at"},"french":{"name":"Généré à"},"portuguese":{"name":"Generated at"},"italian":{"name":"Generated at"},"german":{"name":"Generiert bei"},"turkish":{"name":"Generated at"}},"Add Unit":{"english":{"name":"Add Unit"},"korean":{"name":"개체 추가"},"spanish":{"name":"Add Unit"},"french":{"name":"Jouter Unité"},"portuguese":{"name":"Add Unit"},"italian":{"name":"Add Unit"},"german":{"name":"Gerät hinzufügen"},"turkish":{"name":"Add Unit"}},"E-mail":{"english":{"name":"E-mail"},"korean":{"name":"이메일"},"spanish":{"name":"E-mail"},"french":{"name":"Courriel"},"portuguese":{"name":"E-mail"},"italian":{"name":"E-mail"},"german":{"name":"E-mail"},"turkish":{"name":"E-mail"}},"Reports":{"english":{"name":"Reports"},"korean":{"name":"리포트"},"spanish":{"name":"Reports"},"french":{"name":"Rapports"},"portuguese":{"name":"Reports"},"italian":{"name":"Reports"},"german":{"name":"Berichte"},"turkish":{"name":"Reports"}},"Database":{"english":{"name":"Database"},"korean":{"name":"데이터베이스"},"spanish":{"name":"Database"},"french":{"name":"Base de Données"},"portuguese":{"name":"Database"},"italian":{"name":"Database"},"german":{"name":"Datenbasis"},"turkish":{"name":"Database"}},"Status":{"english":{"name":"Status Lights"},"korean":{"name":"상태 표시등"},"spanish":{"name":"Status Lights"},"french":{"name":"Voyant d'État"},"portuguese":{"name":"Status Lights"},"italian":{"name":"Status Lights"},"german":{"name":"Status"},"turkish":{"name":"Status Lights"}},"Language":{"english":{"name":"Language"},"korean":{"name":"언어"},"spanish":{"name":"Language"},"french":{"name":"Langage"},"portuguese":{"name":"Language"},"italian":{"name":"Language"},"german":{"name":"Sprache"},"turkish":{"name":"Language"}},"DateTime":{"english":{"name":"Timestamp"},"korean":{"name":"시간"},"spanish":{"name":"Timestamp"},"french":{"name":"Horodatage"},"portuguese":{"name":"Timestamp"},"italian":{"name":"Timestamp"},"german":{"name":"Datum/Zeit"},"turkish":{"name":"Timestamp"}},"UserName":{"english":{"name":"User Name"},"korean":{"name":"사용자"},"spanish":{"name":"User Name"},"french":{"name":"Nom de l'Utilisateur"},"portuguese":{"name":"User Name"},"italian":{"name":"User Name"},"german":{"name":"Benutzername"},"turkish":{"name":"User Name"}},"Type":{"english":{"name":"Type"},"korean":{"name":"종류"},"spanish":{"name":"Type"},"french":{"name":"Type"},"portuguese":{"name":"Type"},"italian":{"name":"Type"},"german":{"name":"Typr"},"turkish":{"name":"Type"}},"Trying to reconnect":{"english":{"name":"Trying to reconnect"},"korean":{"name":"재연결 시도중"},"spanish":{"name":"Trying to reconnect"},"french":{"name":"Trying to reconnect"},"portuguese":{"name":"Trying to reconnect"},"italian":{"name":"Trying to reconnect"},"german":{"name":"Trying to reconnect"},"turkish":{"name":"Trying to reconnect"}},"Syncing":{"english":{"name":"Syncing"},"korean":{"name":"동기화 진행중.."},"spanish":{"name":"Détecteur Sync à jour"},"french":{"name":"Détecteur Sync à jour"},"portuguese":{"name":"Syncing"},"italian":{"name":"Syncing"},"german":{"name":"Syncing"},"turkish":{"name":"Syncing"}}},"@func":{"frac_value":"(function(int){return (int/(1<<15));})","mm":"(function(dist,metric){if(metric==0){return (dist/25.4).toFixed(1) + ' in'}else{ return dist + ' mm'}})","prod_name_u16_le":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})","dsp_name_u16_le":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})","dsp_serno_u16_le":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})","rec_date":"(function(val){var dd = val & 0x1f; var mm = (val >> 5) & 0xf; var yyyy = ((val>>9) & 0x7f) + 1996; return yyyy.toString() + '/' + mm.toString() + '/' + dd.toString()})","phase_spread":"(function(val){return Math.round((val/(1<<15))*45)})","phase":"(function(val,wet){ if(wet == 0){if((((val/(1<<15))*45)+90) <= 135){return (((val/(1<<15))*45)+90).toFixed(2); }else{ return ((val/(1<<15))*45).toFixed(2); }}else{ return ((val/(1<<15))*45).toFixed(2);}})","rej_del":"(function(ticks,tack) { if(tack==0){return (ticks/231.0).toFixed(2);}else{return ticks;}})","belt_speed":"(function(tpm,metric,tack){if(tack!=0){return tpm;} var speed= (231.0/tpm)*60; if (metric==0){return (speed*3.281).toFixed(1) + ' ft/min';}else{return speed.toFixed(1) + ' M/min'}})","password8":"(function(words){return words.map(function(w){return((w&0xffff).toString(16))}).join(',');})","rej_chk":"(function(rc1,rc2){if(rc2==0){return rc1+rc2;}else{return 2;}})","rej_mode":"(function(rc1,rc2){if(rc2==0){return rc1+rc2;}else{return 2;}})","rej_latch":"(function(rc1,rc2){if(rc2==0){return rc1+rc2;}else{return 2;}})","prod_name":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})","peak_mode":"(function(eye,time){if(eye == 0){return(time*2;)}else{return 1;}})","phase_mode":"(function(rc1,rc2){if(rc2==0){return rc1+rc2;}else{return 2;}})","eye_rej":"(function(photo,lead,width){if(photo == 0){return 3;}else{if(lead==0){if(width==0){return 0;}else{return 2;}}else{ return 1;}}})","bit_array":"(function(val){if(val == 0){return 0;}else{ var i = 0; while(i<16 && ((val>>i) & 1) == 0){ i++; } i++;  return i; } })","patt_frac":"(function(val){return (val/10.0).toFixed(1)})","eye_rej_mode":"(function(val,photo,width){if(photo == 0){return 3;}else{if(val==0){if(width==0){return 0;}else{return 2;}}else{ return 1;}}})","ipv4_address":"(function(words){return words.map(function(w){return [(w>>8)&0xff,w&0xff].join('.')}).join('.');})","username":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})","user_opts":"(function(opts){return opts});","password_hash":"(function(phash){    var buf = Buffer.alloc(8); buf.writeUInt16LE(phash[1],0); buf.writeUInt16LE(phash[0],2); buf.writeUInt16LE(phash[2],6); buf.writeUInt16LE(phash[3],4);return buf;});","det_thresh":"(function(fm,mode,wet,r,x){if(mode == 0){ if(wet == 0){ return r; }else{ return x; }}else{ return fm; }})"}
}
const funcJSON ={
	"@func":{"frac_value":"(function(int){return (int/(1<<15));})",
      "mm":"(function(dist,metric){if(metric==0){return (dist/25.4).toFixed(1) + ' in'}else{ return dist + ' mm'}})",
      "prod_name_u16_le":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})",
      "dsp_name_u16_le":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})",
      "dsp_serno_u16_le":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})",
      "rec_date":"(function(val){var dd = val & 0x1f; var mm = (val >> 5) & 0xf; var yyyy = ((val>>9) & 0x7f) + 1996; return yyyy.toString() + '/' + mm.toString() + '/' + dd.toString()})",
      "phase_spread":"(function(val){return Math.round((val/(1<<15))*45)})",
      "phase":"(function(val,wet){ if(wet == 0){if((((val/(1<<15))*45)+90) <= 135){return (((val/(1<<15))*45)+90).toFixed(2); }else{ return ((val/(1<<15))*45).toFixed(2); }}else{ return ((val/(1<<15))*45).toFixed(2);}})",
      "rej_del":"(function(ticks,tack) { if(tack==0){return (ticks/231.0).toFixed(2);}else{return ticks;}})",
      "belt_speed":"(function(tpm,metric,tack,tps){if(tack!=0){var speed= (tps/tpm)*60;  if (metric==0){return (speed*3.281).toFixed(1) + ' ft/min';}else{return speed.toFixed(1) + ' M/min'}} var speed= (231.0/tpm)*60; if (metric==0){return (speed*3.281).toFixed(1) + ' ft/min';}else{return speed.toFixed(1) + ' M/min'}})",
      "password8":"(function(words){return words.map(function(w){return((w&0xffff).toString(16))}).join(',');})",
      "rej_chk":"(function(rc1,rc2){if(rc2==0){return rc1+rc2;}else{return 2;}})",
      "rej_mode":"(function(rc1,rc2){if(rc2==0){return rc1+rc2;}else{return 2;}})",
      "rej_latch":"(function(rc1,rc2){if(rc2==0){return rc1+rc2;}else{return 2;}})",
      "prod_name":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})",
      "peak_mode":"(function(eye,time){if(eye == 0){return(time*2;)}else{return 1;}})",
      "phase_mode":"(function(rc1,rc2){if(rc2==0){return rc1+rc2;}else{return 2;}})",
      "eye_rej":"(function(photo,lead,width){if(photo == 0){return 3;}else{if(lead==0){if(width==0){return 0;}else{return 2;}}else{ return 1;}}})",
      "bit_array":"(function(val){if(val == 0){return 0;}else{ var i = 0; while(i<16 && ((val>>i) & 1) == 0){ i++; } i++;  return i; } })",
      "patt_frac":"(function(val){return (val/10.0).toFixed(1)})",
      "eye_rej_mode":"(function(val,photo,width){if(photo == 0){return 3;}else{if(val==0){if(width==0){return 0;}else{return 2;}}else{ return 1;}}})",
      "ipv4_address":"(function(words){return words.map(function(w){return [(w>>8)&0xff,w&0xff].join('.')}).join('.');})",
      "username":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})",
      "user_opts":"(function(opts){return opts});",
      "password_hash":"(function(phash){    var buf = Buffer.alloc(8); buf.writeUInt16LE(phash[1],0); buf.writeUInt16LE(phash[0],2); buf.writeUInt16LE(phash[2],6); buf.writeUInt16LE(phash[3],4);return buf;});",
      "det_thresh":"(function(fm,mode,wet,r,x){if(mode == 0){ if(wet == 0){ return r; }else{ return x; }}else{ return fm; }})",
      "phase_offset":"(function(val){return val;})"
      }
	}


var vdefMapST = {};

var categories;
var netMap = vdefMapV2['@netpollsmap']

var vMapV2 = vdefMapV2["@vMap"]
var categoriesV2 = [vdefMapV2["@categories"]]
var catMapV2 = vdefMapV2["@catmap"]


let vdefList ={};
let vdefByMac = {};
var _Vdef;
var _pVdef;
let isVdefSet = false;
var ftiTouch = true //this.
var _nVdf;

const _ioBits = ['TACH','EYE','RC_1','RC_2','REJ_EYE','AIR_PRES','REJ_LATCH','BIN_FULL','REJ_PRESENT','DOOR1_OPEN','DOOR2_OPEN','CLEAR_FAULTS','CLEAR_WARNINGS','PHASE_HOLD','CIP','CIP_TEST','CIP_PLC','PROD_SEL1','PROD_SEL2','PROD_SEL3','PROD_SEL4',
                  'TEST','NONE','REJ_MAIN','REJ_ALT','FAULT','TEST_REQ','HALO_FE', 'HALO_SS', 'LS_RED','LS_YEL','LS_GRN','LS_BUZ','DOOR_LOCK','SHUTDOWN_LANE']

Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize){
        var temporal = [];
        
        for (var i = 0; i < this.length; i+= chunkSize){
            temporal.push(this.slice(i,i+chunkSize));
        }
                
        return temporal;
    }
});
var packetPool = createPool(function(){return {}});

class Params{
  static frac_value(int){
    return (int/(1<<15))
  }
  static mm(dist, metric){
    if(metric==0){
      return (dist/25.4).toFixed(1) + " in"

    }
    else{
      return dist + " mm";
    }

  }
  static prod_name_u16_le(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
  }
  static dsp_name_u16_le(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
  }
  static dsp_serno_u16_le(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
  }
  static rec_date(val){
    var dd = val & 0x1f;
    var mm = (val >> 5) & 0xf
    var yyyy = ((val>>9) & 0x7f) + 1996
    return yyyy.toString() + '/' + mm.toString() + '/' + dd.toString();
  }
  static phase_spread(val){
    return Math.round(Params.frac_value(val)*45)
  }
  static phase_wet(val){
    return ((Params.frac_value(val) * 45)).toFixed(2);
  }
  static phase_dry(val){
    if(((Params.frac_value(val) * 45)+90) <= 135){
      return ((Params.frac_value(val) * 45)+90).toFixed(2); 
    }
    else{
      return ((Params.frac_value(val) * 45)).toFixed(2);
      
    }

  }
  static phase(val, wet){
    if(wet==0){
      return Params.phase_dry(val);
    }else{
      return Params.phase_wet(val);
    }
  }
  static phase_offset(val){
  	return val
  }
  static rej_del(ticks, tack){
    if(tack==0){
      return (ticks/231.0).toFixed(2); 
    }else{
      return ticks;
    }
  }
  static belt_speed(tpm, metric, tack){
    if(tack!=0){

      return tpm;
    }
    var speed = (231.0/tpm) * 60;
    if(metric==0){
      return (speed*3.281).toFixed(1) + ' ft/min'
    }else{
      return speed.toFixed(1) + ' M/min'
    }
  
  }
  static password8(words){
  
    var res = words.map(function(w){
      return ((w & 0xffff).toString(16))
    }).join(',')
    return(res)

  }
  static rej_chk(rc1, rc2){
    if (rc2==0){
      if(rc1==0){
        return 0
      }else{
        return 1
      }
    }else{
      return 2
    }
  }
  static rej_mode(photo, rev){
    if (rev==0){
      if (photo==0){
        return 0;
      }else{
        return 1;
      }
    }else{
      return 2;
    }
  }

  static rej_latch(latch, toggle){
    if (toggle==0){
      if (latch==0){
        return 0;
      }else{
        return 1;
      }
    }else{
      return 2;
    }
  }
  static prod_name(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
  }


  static peak_mode(eye, time){
    if (eye==0){
      if (time==0){
        return 0;
      }else{
        return 2;
      }
    }else{
      return 1;
    }
  }


  static eye_rej(photo, lead, width){
    if (photo==0){
      return 3;
    }else{
      if(lead==0){
        if(width==0){
          return 0;
        }else{
          return 2;
        }
      }else{
        return 1;
      }
    }
  }
  static phase_mode(wet, patt){
    ////////console.log(patt)
    if (patt==0){
      if (wet==0){
        return 0;
      }
      else{
        return 1;
      }
    }else{
      return 2;
    }
  }
  
  static bit_array(val){
    if(val == 0){
      return 0;
    }else{
      var i = 0;
      while(i<16 && ((val>>i) & 1) == 0){
        i++;
      }
      i++; //1 based index
      return i;
    }
  }

  static patt_frac(val){
    return (val/10.0).toFixed(1);
  }

  static eye_rej_mode(val, photo, width){
    if(photo == 0){
      return 3;
    }else{
      if (val == 0){
        if (width == 0){
          return 0;
        }else{
          return 2;
        }
      }else{
        return 1;
      }
    }
    
  }

  static  swap16(val){
      return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
  }

  static  convert_word_array_BE(byteArr){
    var b = new Buffer(byteArr)
    var length = byteArr.length/2;
    var wArray = []
    ////////console.log(length)
    for(var i = 0; i<length; i++){
      wArray.push(b.readUInt16BE(i*2));
    }
    ////////console.log(wArray)
    return wArray;

  }

  static convert_word_array_LE(byteArr){
    var b = new Buffer(byteArr)
    var length = byteArr.length/2;
    var wArray = []
    ////////console.log(length)
    for(var i = 0; i<length; i++){
      wArray.push(b.readUInt16LE(i*2));
    }
    ////////console.log(wArray)
    return wArray;

  }
  static ipv4_address(words){
    //todo
    ////////console.log(ip)
    //return ip
    return words.map(function(w){return [('000'+((w>>8)&0xff).toString()).slice(-3),('000'+(w&0xff).toString()).slice(-3)].join('.')}).join('.');
  }
}

function yRangeFunc(range){
	var max = 200;
	if(Math.abs(range.max) > max){
		max = Math.abs(range.max)
	}
	if(Math.abs(range.min) > max){
		max = Math.abs(range.min)
	}
	return({min:(0-max),max:max});
}
function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}
function uintToInt(uint, nbit) {
    nbit = +nbit || 32;
    if (nbit > 32) throw new RangeError('uintToInt only supports ints up to 32 bits');
    uint <<= (32 - nbit);
    uint >>= 32 - nbit;
    return uint;
}
function getVal(arr, rec, key, pVdef){
    var param = pVdef[rec][key]
    if(param['@bit_len']>16){

      return wordValue(arr, param)
    }else{
      var val;
      if((param['@bit_pos'] + param['@bit_len']) > 16){
        var wd = (Params.swap16(arr[param['@i_var']+1])<<16) | Params.swap16((arr[param['@i_var']]))
        val = (wd >> param["@bit_pos"]) & ((1<<param["@bit_len"])-1)
        
      }else{
        val = Params.swap16(arr[param["@i_var"]]);
      } 
      if(param["@bit_len"] < 16){
        val = (val >> param["@bit_pos"]) & ((1<<param["@bit_len"])-1)
      }
      return val;
    }
}
function wordValue(arr, p){

    var n = Math.floor(p["@bit_len"]/16);
    var sa = arr.slice(p["@i_var"], p["@i_var"]+n)
    if(p['@type']){

    	return	 eval(funcJSON['@func'][p['@type']])(sa)
    //  return eval(funcJSON['@func'][p['@type']].apply(this, sa))
    }else{
      var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str; 
    }
    
}
function isDiff(x, y){
    if((typeof x) != (typeof y)){
      return true;
    }
    for(var p in x){
      if(typeof y[p] != 'undefined'){
        if(!(x[p] == y[p])){
          return true
        }
      }else{
        return true
      }
    }
    return false;
}
function dsp_rpc_paylod_for (n_func, i16_args, byte_data) {
        var rpc = [];
        var n_args = i16_args.length;
        var bytes = [];
        if (n_args > 3) n_args = 3;
        if (typeof byte_data == "string") {
          for(var i=0; i<byte_data.length; i++) {
              bytes.push(byte_data.charCodeAt(i));
          }         
        } else if (byte_data instanceof Array) {
          bytes = byte_data;
         }
        rpc[0] = n_func;
        rpc[1] = n_args;
        if (bytes.length > 0) rpc[1] += 4;
        var j=2;
        for(var i=0; i<n_args; i++) {
        	var i16arg = i16_args[i] 
        	if(i16arg > 0xffff){
        		i16arg = 0xffff
        	}
          rpc[j] = i16arg & 0xff; j+= 1;
          rpc[j] = (i16arg >> 8) & 0xff; j+= 1;
        }
        if (bytes.length > 0) rpc = rpc.concat(bytes);
        
        var cs = fletcherCheckBytes(rpc);
        var cs1=255-((cs[0]+cs[1])%255); 
        var cs2=255-((cs[0]+cs1)%255);
        rpc.push(cs1);
        rpc.push(cs2);
        return rpc;
}
function fletcherCheckBytes (data) {
    var c1=0, c2=0;
    for(var i=0; i<data.length; i++) {
        c1 += data[i]; if (c1 >=255) c1 -= 255;
        c2 += c1;      if (c2 >=255) c2 -= 255;
    }
    return [c1,c2];
}
class FtiSockIo{
	constructor(url){
		this.sock = new WebSocket(url)
		this.handlers = {}
		var self = this;
		this.sock.onmessage = function (message) {
			// body...
			var msg = JSON.parse(message.data)
			self.handle(msg.event, msg.data);
			message = null;
			msg = null;
			//packetPool.recycle(obj);
		}
		this.sock.onopen = function (argument) {
			// body...
		//	self.emit('locateReq');
			self.emit('getVersion');
			self.emit('getPrefs');
		}

	}
	handle(ev,data){
		if(this.handlers[ev]){
			this.handlers[ev](data)
			data = null;
		}else{
			//console.log(465,ev)
		}

	}
	on(handle, func){
		////////console.log(handle)
		this.handlers[handle] = func
	}
	off(handle){
		this.handlers[handle] = 0;
	}
	emit(handle,data){
		if(data){
			//////console.log('data is present')
		}else{
			//////console.log('data null')
			data = 1
		}
		//data = data || 1
		this.sock.send(JSON.stringify({event:handle,data:data}));
		data = null;
	}
}

var _wsurl = 'ws://' +location.host 
var socket = new FtiSockIo(_wsurl);

var liveTimer = {}
var myTimers = {}

var located = false;
var cnt = 0;

socket.on('vdef', function(vdf){
	////console.log('on vdef')
var json = vdf[0];
_Vdef = json
//console.log(511,json)
  var res = [];
    res[0] = {};
    res[1] = {};
    res[2] = {};
    res[3] = {};
    res[4] = {};
    res[8] = {};
   var nVdf = [[],[],[],[],[]];

   

    json["@params"].forEach(function(p ){

      res[p["@rec"]][p["@name"]] = p;
      res[8][p["@name"]] = p;
      nVdf[p["@rec"]].push(p['@name'])

   
    }
    );
    res[5] = json["@deps"];
    res[6] = json["@labels"]
    res[7] = [];
   for(var par in res[2]){  
      if(par.indexOf('Fault') != -1){
        //////console.log("fault found")
        res[7].push(par)
      }
    }

    _pVdef = res;
    if(json['@defines']['INTERCEPTOR']){
         vdefList[json['@version']] = [json, res, nVdf, categories, [vdefMapV2['@categories']], vdefMapV2['@vMap'], vdefMapV2['@pages'], vdefMapV2['@acc']]
        vdefByMac[vdf[1].mac] = [json, res, nVdf, categories, [vdefMapV2["@categories"]], vdefMapV2['@vMap'], vdefMapV2['@pages'], vdefMapV2['@acc']]

    }else{
         vdefList[json['@version']] = [json, res, nVdf, categories, [vdefMapST['@categories']], vdefMapST['@vMap'], vdefMapST['@pages']]
        vdefByMac[vdf[1].mac] = [json, res, nVdf, categories, [vdefMapST["@categories"]], vdefMapST['@vMap'], vdefMapST['@pages']]

    }
   //console.log('552',vdefByMac)
    isVdefSet = true;
    
})


socket.on('echo',function(){
	setTimeout(function(){
		socket.emit('echoback')
	},100)
	//socket.emit('echoback')
})
/*******************************************/

function setScrollTop(id, top) {
	// body...
	var elem = document.getElementById(id)
	elem.scrollTop = top;
	//elem.scrollTo(0,top)
}
function scrollById(id,distance, duration) {

    var initialY = document.getElementById(id).scrollTop;
    var y = initialY + distance;
    var baseY = (initialY + y) * 0.5;
    var difference = initialY - baseY;
    var startTime = performance.now();

    function step() {
        var normalizedTime = (performance.now() - startTime) / duration;
        if (normalizedTime > 1) normalizedTime = 1;

        document.getElementById(id).scrollTo(0, baseY + difference * Math.cos(normalizedTime * Math.PI));
        if (normalizedTime < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
}
function _scrollById(id,distance) {

	var elem = document.getElementById(id)
   
    elem.scrollTop = elem.scrollTop + distance
}
class TestSetupPage extends React.Component {
	getInitialState(){
		return({})
	}
	render(){
		return (<div>
		
	</div>)
	}

}



function getParams(cat, pVdef, sysRec, prodRec, _vmap, dynRec){
	var params = []
	cat.params.forEach(function(p) {
    	var _p = {'@name':p, '@children':[]}
   		if(typeof pVdef[0][p] != 'undefined'){
   			_p = {'@name':p, '@data':sysRec[p], '@children':[]}
   		}else if(typeof pVdef[1][p] != 'undefined'){
    		_p = {'@name':p, '@data':prodRec[p], '@children':[]}
    	}else if(typeof pVdef[2][p] != 'undefined'){
    		_p = {'@name':p, '@type':'dyn','@data':dynRec[p], '@children':[]}
    	}
    	////////console.log(_vmap[p])
    	////////console.log(p)
    	_vmap[p].children.forEach(function (ch) {
    		var _ch;
    		if(typeof pVdef[0][ch] != 'undefined'){
    			_ch = sysRec[ch]
    		}else if(typeof pVdef[1][ch] != 'undefined'){
    			_ch = prodRec[ch]
    		}else if(typeof pVdef[2][ch] != 'undefined'){
    			
    			_ch = dynRec[ch]
    		}
    		_p['@children'].push(_ch)	
    	})
    	params.push(_p)
    					
    })
	return params
}
function getParams2(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram){
	var params = []
	////////console.log(cat)
	////////console.log(pVdef)
	cat.params.forEach(function(par) {
		if(par.type == 0){

			var p = par.val
			////////console.log(p)
    		var _p = null//{'type':0, '@name':p, '@children':[], acc:par.acc}
   			if(typeof pVdef[0][p] != 'undefined'){
   				_p = {'type':0, '@name':p, '@data':sysRec[p], '@children':[], acc:par.acc}
   			}else if(typeof pVdef[1][p] != 'undefined'){

   				var data = prodRec[p]
   				if(pVdef[1][p]['@labels'] == "FaultMaskBit"){
   					if(prodRec[p.slice(0,-4) + "Warn"]){
   						data = data + prodRec[p.slice(0,-4) + "Warn"];
   					}
   					
   				}
    			_p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
    			if(p == 'BeltSpeed'){
   					////console.log('653',par,_p)
   				}
    		}else if(typeof pVdef[2][p] != 'undefined'){
    			_p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[p], '@children':[], acc:par.acc}
    		}else if(typeof pVdef[3][p] != 'undefined'){
    			_p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc}
    		}else if(par.val == 'Nif_ip'){
    			_p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc}
    		}else if(par.val == 'Nif_nm'){
    			_p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc}
    		}else if(par.val == 'Nif_gw'){
    			_p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc}
    		}else if(par.val == 'DCRate_A'){
    			_p = {'type':0, '@name':p,'@data':prodRec[p], '@children':[], acc:par.acc}
    		}    	////////console.log(_vmap[p])
    	////////console.log(p)
    		if(_p != null){
    		
    		_vmap[p].children.forEach(function (ch) {
    			var _ch;
    			if(typeof pVdef[0][ch] != 'undefined'){
    			_ch = sysRec[ch]
    			}else if(typeof pVdef[1][ch] != 'undefined'){
    			_ch = prodRec[ch]
    			}else if(typeof pVdef[2][ch] != 'undefined'){
    			
    				_ch = dynRec[ch]
    			}else if(typeof pVdef[3][ch] != 'undefined'){
    			
    				_ch = fram[ch]
    			}else if(ch == 'DCRate_B'){
    				_ch = prodRec[ch]
    			}
    			_p['@children'].push(_ch)	
    		})
    			params.push(_p)
    		}
    		
    	}else if(par.type == 1){
    		if(typeof par.child != 'undefined'){
    			params.push({type:1, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram), acc:par.acc, child:par.child})
    		}else{


    			params.push({type:1, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram), acc:par.acc})
    		}
    	}else if(par.type == 2){
    			if(typeof par.child != 'undefined'){
    			params.push({type:2, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram), acc:par.acc, child:par.child})
    		}else{


    			params.push({type:2, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram), acc:par.acc})
    		}
    	}
    					
    })
	return params
}
//var cat = _cvdf.slice(0)
function iterateCats(cat, pVdef, sysRec, prodRec, _vmap, dynRec){

	cat.params = getParams(cat, pVdef, sysRec, prodRec, _vmap, dynRec)
	var subCats = cat.subCats.map(function (sc) {

		return iterateCats(sc, pVdef, sysRec, prodRec, _vmap, dynRec)
	})
	cat.subCats = subCats;
	return cat
	
}
function iterateCats2(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram){
	////////console.log(['684',pVdef])
	cat.params = getParams2(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram)
	
	return cat
	
}
//for efficiency, and limited depth: 
function noRecursion(cat, pVdef, sysRec, prodRec, _vmap) {
	// body...
	var ct = cat;
	ct.params = getParams(ct, pVdef, sysRec, prodRec, _vmap)
	ct.subCats.forEach(function (sc) {
		sc.params = getParams(sc, pVdef, sysRec, prodRec, _vmap)
		sc.subCats.forEach(function(ssc){
			ssc.params = getParams(ssc, pVdef, sysRec, prodRec, _vmap)
			ssc.subCats.forEach(function(sssc){
				sssc.params = getParams(sssc, pVdef, sysRec, prodRec, _vmap)
				sssc.subCats.forEach(function(ssssc){
					ssssc.params = getParams(ssssc, pVdef, sysRec, prodRec, _vmap)
					ssssc.subCats.forEach(function(sssssc){
						sssssc.params = getParams(sssssc, pVdef, sysRec, prodRec, _vmap)
					})
				})
			})
		})
		// body...
	})
	return ct;
}
//const DetectorContext = React.createContext({nifip:'0.0.0.0',nifgw:'0.0.0.0',nifgw:'255.255.255.0', acc:0,accounts:[],det:{},mac:'',ip:'',netpolls:[]})
const FastZoom = cssTransition({ 
	enter: 'zoomIn',
  exit: 'zoomOut',
  duration: 300  
})
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });

    // You can also log the error to an error reporting service
    //logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
class Container extends React.Component{
 constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
   componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });

    //console.log(765, error, info)
     toast('error')
  }

	render(){
		return (<div>
		<LandingPage/>	
		<ToastContainer position="top-center"
autoClose={1500}
hideProgressBar
newestOnTop
closeOnClick
closeButton={false}
rtl={false}
pauseOnVisibilityChange
draggable
pauseOnHover
transition={FastZoom}
toastClassName='notifications-class'
/>
			
		</div>)
	}
}
class LandingPage extends React.Component{
	constructor(props) {
		super(props)
		var minMq = window.matchMedia("(min-width: 400px)");
		var mq = window.matchMedia("(min-width: 1000px)");

		
		var mqls = window.matchMedia("(orientation: landscape)")
		
		//for (var i=0; i<mqls.length; i++){
		
		//}//
		this.state =  ({currentPage:'landing',netpolls:{}, mqls:mqls,curIndex:0, minMq:minMq,landScape:mqls.matches, minW:minMq.matches, mq:mq, brPoint:mq.matches, progress:'',
			curModal:'add',detectors:[], mbunits:[],ipToAdd:'',curDet:'',dets:[], curUser:'',tmpUid:'',level:5, version:'2018/07/30',pmsg:'',pON:false,percent:0,
			detL:{}, macList:[], tmpMB:{name:'NEW', type:'mb', banks:[]}, accounts:['operator','engineer','Fortress'],usernames:['ADMIN','','','','','','','','',''], nifip:'', nifnm:'',nifgw:''})
		this.listenToMq = this.listenToMq.bind(this);
		mq.addListener(this.listenToMq)
		minMq.addListener(this.listenToMq)
		mqls.addListener(this.listenToMq);
		this.locateUnits = this.locateUnits.bind(this);
		this.onNetpoll = this.onNetpoll.bind(this);
		this.onRMsg = this.onRMsg.bind(this);
		this.onParamMsg2 = this.onParamMsg2.bind(this);
		this.ipChanged = this.ipChanged.bind(this);
		this.renderDetectors = this.renderDetectors.bind(this);
		this.renderDetector = this.renderDetector.bind(this);
		this.showFinder = this.showFinder.bind(this);
		this.switchUnit = this.switchUnit.bind(this);
		this.addMBUnit = this.addMBUnit.bind(this);
		this.editMb = this.editMb.bind(this);
		this.addToTmp = this.addToTmp.bind(this);
		this.addToTmpGroup = this.addToTmpGroup.bind(this);
		this.addToTmpSingle = this.addToTmpSingle.bind(this);
		this.removeFromTmpGroup = this.removeFromTmpGroup.bind(this);
		this.cancel = this.cancel.bind(this);
		this.submitMB = this.submitMB.bind(this);
		this.submitMBe = this.submitMBe.bind(this);
		this.move = this.move.bind(this)
		this.removeMb = this.removeMb.bind(this)
		this.renderModal = this.renderModal.bind(this);
		this.changetMBName =this.changetMBName.bind(this);
		this.editName =this.editName.bind(this);
		this.renderMBGroup = this.renderMBGroup.bind(this)
		this.logoClick = this.logoClick.bind(this);
		this.save = this.save.bind(this);
		this.addNewSingleUnit = this.addNewSingleUnit.bind(this);
		this.addMBUnit = this.addMBUnit.bind(this);
		this.setAuthAccount = this.setAuthAccount.bind(this);
		this.showDisplaySettings = this.showDisplaySettings.bind(this);
		//var self = this;
		/*Object.getOwnPropertyNames(this).forEach(function(f){
			this[f] = this[f].bind(this)
		}).bind(this);*/
	}
	listenToMq(argument) {
		// body...
		if(this.refs.dv){
			//console.log(this.state.mqls.matches)
			this.refs.dv.setState({br:this.state.mq.matches,landScape:this.state.mqls.matches, update:true})
		}
		this.setState({brPoint:this.state.mq.matches, landScape:this.state.mqls.matches})
	}
	locateUnits(callback) {
		located = false;
		socket.emit('hello','landing')
		this.refs.findDetModal.toggle();
	}
	locateB(){
		socket.emit('locateReq', 'b')
	}
	componentDidMount() {
		var self = this;
		this.loadPrefs();
		//socket.on()
		socket.on('resetConfirm', function (r) {
			socket.emit('locateReq');
		})
		socket.on('nif', function(iface){
			//console.log('811', iface)
			self.setState({nifip:iface.address, nifnm:iface.netmask})
		})
		socket.on('version',function (version) {
			// body...
			self.setState({version:version})
		})
		socket.on('gw', function(gw){
			//console.log('823', gw)
			self.setState({nifgw:gw})
		})
		socket.on('displayUpdate', function(){
			self.refs.updateModal.toggle();
		})
		socket.on('updateProgress',function(r){
			self.setState({progress:r})
		})
		socket.on('onReset', function(r){
			/*if(self.state.currentPage != 'landing'){
				self.setState({curDet:self.state.dets[self.state.curDet.mac]})
			}*/
			self.setState({currentPage:'landing', curDet:''});
			
		})
	
		socket.on('netpoll', function(m){
			////////////console.log(['73',m])
			self.onNetpoll(m.data, m.det)
			m = null;
		})
		socket.on('prefs', function(f) {
			//////////console.log(f)
			var detL = self.state.detL
			var cnt = 0;
			var _ip = ''
			f.forEach(function (u) {
				u.banks.forEach(function(b){
					detL[b.mac] = null
					cnt++;
					_ip = b.ip
				})
			})
			if(cnt == 1){
				socket.emit('locateUnicast', _ip)
			}else{
				socket.emit('locateReq')
			}
			setTimeout(function (argument) {
			// body...
			if(self.state.mbunits.length == 1){
				if(self.state.currentPage == 'landing'){
					if(self.state.mbunits[0].banks.length == 1){
						if(vdefByMac[self.state.mbunits[0].banks[0].mac]){
							//console.log('try first here?')
							self.switchUnit(self.state.mbunits[0].banks[0])
						}else{
							setTimeout(function () {
								// body...
								if(self.state.currentPage == 'landing'){
									//console.log('switch?')
									if(vdefByMac[self.state.mbunits[0].banks[0].mac]){
										self.switchUnit(self.state.mbunits[0].banks[0])
									}
								}
							},4000)
						}
					}
					
				}	
			}
		},800)
			self.setState({mbunits:f, detL:detL})
		})
		socket.on('notify',function(msg){
			toast(msg)
		})
		socket.on('progressNotify',function(pk){
			var on = pk.on;
			var msg = pk.msg;
			var percentage = pk.percentage
		})
		socket.on('testusb',function(dev){

			//console.log(['testusb',dev])
		})
		socket.on('noVdef', function(det){
			setTimeout(function(){
				socket.emit('vdefReq', det);
			}, 1000)
		})
		socket.on('notvisible', function(e){
			toast('Detectors located, but network does not match')
		})
		socket.on('locatedResp', function (e) {
		try{
		if(typeof e[0] != 'undefined'){
			var dets = self.state.detL;
			var macs = self.state.macList.slice(0);
			var nps = self.state.netpolls;
			if(e.length == 1){

			}
			
			var detectors = [];
			e.forEach(function(d){
					
					macs.push(d.mac)
					dets[d.mac] = d;
					if(macs.indexOf(d.mac) == -1){
						macs.push(d.mac)
						dets[d.mac] = d
					}
					//////////console.log(d)
					socket.emit('vdefReq', d);

			})
			var mbunits = self.state.mbunits;
			mbunits.forEach(function(u){
				var banks = u.banks.map(function(b){
					if(dets[b.mac]){
						var _bank = dets[b.mac]
						_bank.interceptor = b.interceptor
						return dets[b.mac]
					}else{
						return b
					}
				})
				//console.log(['852',u.banks.slice(0), banks])
				u.banks = banks;
			})
			var curDet = self.state.curDet;

			if(self.state.currentPage != 'landing'){
				if(dets[curDet.mac]){
					curDet = dets[curDet.mac];
				}
				else{
					//console.log(895, 'this is the problem')
				}
			}
			//////////console.log(dets)
			mbunits.forEach(function(u){
				u.banks.forEach(function(b) {

					dets[b.mac] = null;
					if(!nps[b.ip]){
						nps[b.ip] = []
					}
					//////console.log('connectToUnit')
					socket.emit('connectToUnit', b.ip)
				})
			})
		
			socket.emit('savePrefs', mbunits)
			var nfip = self.state.nifip;
			if(e.length > 1){
				nfip = e[0].nif_ip
			}
			self.setState({dets:e, detL:dets, mbunits:mbunits,curDet:curDet, macList:macs, netpolls:nps, nifip:nfip})
		}
	}catch(er){
		//console.log(914,er)
	//	toast(er.message)
	}
		});
		
		socket.on('paramMsg2', function(data) {
		//	//////console.log('on param msg')
			////console.log(data)
			self.onParamMsg2(data.data,data.det) 
			data = null;
		})
		socket.on('rpcMsg', function (data) {
			////console.log(data)
			self.onRMsg(data.data, data.det)
			data = null;
		})
		socket.on('loggedIn', function(data){
			self.refs.logIn.toggle();
			self.setState({curUser:data.id, level:data.level})
		})

		socket.on('logOut', function(){
			self.setState({curUser:'', level:0})
		})
		socket.on('accounts', function(data){
			//console.log(data)
			self.setState({accounts:data.data})
		})
		socket.on('userNames', function(p){
			////console.log(['808', p])
			if(self.refs.dv){
				self.refs.dv.setState({usernames:p.det.data.array, update:true})
			}
			
		})
		socket.on('authResp', function(pack){
			self.setAuthAccount(pack)
		})
		socket.on('authFail', function(){
			toast('Authentication failed')
			self.setAuthAccount({user:'Not Logged In', level:0, user:-1})
		})
		
	}
	setAuthAccount(pack){
		if(this.refs.dv){
			this.refs.dv.setAuthAccount(pack)
		}
	}
	onNetpoll(e,d){
		//////////console.log([e,d])
		var nps = this.state.netpolls
		if(nps[d.ip]){
			if(nps[d.ip].length == 15){
				nps[d.ip].splice(-1,1);
		
			}
			if((e.net_poll_h == 'NET_POLL_PROD_REC_VAR')|| (e.net_poll_h == 'NET_POLL_PROD_SYS_VAR')){
				e.parameters = e.parameters.slice(0,1)
			}
			
			nps[d.ip].unshift(e)
			if(e.net_poll_h == 'NET_POLL_OPERATOR_NO'){
				//////console.log('test started: ' + d.ip)
			}else if(e.net_poll_h == 'NET_POLL_TEST_REQ_PASS'){
				//////console.log('test passed: ' + d.ip)
				//toast('Test Passed')
			}

			this.setState({netpolls:nps})
		}
		
	}
	onRMsg(e,d) {
		//////////console.log([e,d])
		var msg = e.data
		var data = new Uint8Array(msg);

		if(this.refs.dv){
			this.refs.dv.onRMsg(e,d)
		}else if(this.refs[d.mac]){
			this.refs[d.mac].onRMsg(e,d)
		}else {
			var ind = -1
			this.state.mbunits.forEach(function(m,i){
  				m.banks.forEach(function (b) {
  					if(b.mac == d.mac){
  						ind = i;
  					}
  				})
  			}) 
  			if(ind != -1){
  				if(this.refs['mbu' + ind]){
  					this.refs['mbu'+ind].onRMsg(e,d)
  				}
  			}
		}
		msg = null;
		data = null;
		e = null;
		d = null;
	}
	onParamMsg2(e,d) {
		////console.log(vdefByMac[d.mac])
		if(vdefByMac[d.mac]){
		//	//console.log(d)
			if(this.refs[d.mac]){
				this.refs[d.mac].onParamMsg2(e);
			}else{
  				var ind = -1;
  				this.state.mbunits.forEach(function(m,i){
  					m.banks.forEach(function (b) {
  						if(b.mac == d.mac){
  							ind = i;
  						}
  					})
  				}) 
  				if(ind != -1){
  					if(this.refs['mbu' + ind]){
  						this.refs['mbu'+ind].onParamMsg2(e,d);
  					}
  				}
  			}
  			
		
			if(this.refs.dv){
				this.refs.dv.onParamMsg3(e,d)
			}
		}
		e = null;
		d = null;
	}
	onAccounts(data){

	}	
	ipChanged(e) {
		e.preventDefault();
		this.setState({ipToAdd:e.target.value})
	}
	renderDetectors () {
		var self = this;
		var units = this.state.detectors.map(function (u) {
			return <SingleUnit ref={u.mac} onSelect={self.switchUnit} unit={u}/>
		})
		return units;
	}
	showFinder() {
		this.refs.findDetModal.toggle();
		this.locateB()
	}
	logoClick() {this.setState({currentPage:'landing'})}
	switchUnit(u) {
		//////////console.log(u)
		var self = this;
		setTimeout(function () {
			// body...
			if(self.state.currentPage == 'landing'){
				self.setState({curDet:u, currentPage:'detector'})
			}
		},100)	
	}
	addNewMBUnit(){
		var self = this;
		setTimeout(function (argument) {
			// body...
		
		self.setState({curModal:'newMB', tmpMB:{name:'NEW', type:'mb', banks:[]}})
		},100)
	}
	addNewSingleUnit() {
		var self = this;
		setTimeout(function (argument) {
			// body...
			self.setState({curModal:'newSingle', tmpMB:{name:'NEW', type:'single', banks:[]}})
		},100)	
	}
	addMBUnit(mb) {
		var mbunits = this.state.mbunits
		var nps = this.state.netpolls
		mbunits.push(mb)
		mb.banks.forEach(function(b){
			if(!nps[b.ip]){
				nps[b.ip] = []
			}
		})
		this.setState({mbunits:mbunits, netpolls:nps})
	}
	editMb(i) {
		
		var mbunits = this.state.mbunits;

		var mbunit ={}
		mbunit.type = mbunits[i].type;
		mbunit.name = mbunits[i].name;
		mbunit.banks = mbunits[i].banks;
		this.setState({curIndex:i, curModal:'edit', tmpMB:mbunit})
	}
	addToTmp(e, type){
		var cont;
		var dsps = this.state.dets
		var detL = this.state.detL
		var mbUnits;
			cont = this.state.tmpMB.banks;
			mbUnits = this.state.tmpMB
			if(mbUnits.type == 'single'){
			if(cont.length != 0){
				return;
			}
				mbUnits.name = dsps[e].name
			}
			var tmpdsp = dsps[e]
		if(vdefByMac[dsps[e].mac][0]['@defines']['INTERCEPTOR']){
			tmpdsp.interceptor = true
		}else{
			tmpdsp.interceptor = false
		}
		if(true || vdefByMac[dsps[e].mac][0]['@defines']['INTERCEPTOR_DF']){
			tmpdsp.df = true;
		}
		if(vdefByMac[dsps[e].mac][0]['@defines']['FINAL_FRAM_STRUCT_SIZE']){
            tmpdsp.ts_login = true;   
        }
		socket.emit('connect',tmpdsp.ip)
		cont.push(tmpdsp)
		detL[dsps[e].mac] = null;
		mbUnits.banks = cont;
		this.setState({tmpMB:mbUnits, detL:detL})	
	}
	addToTmpGroup(e) {
		this.addToTmp(e,'multi')
	}
	addToTmpSingle(e) {
		this.addToTmp(e,'single')
	}
	removeFromTmpGroup(e) {
		var cont = this.state.tmpMB.banks;
		var dsps = this.state.dets;
		var detL = this.state.detL
		detL[cont[e].mac] = cont[e]
		cont.splice(e,1)
		var mbUnits = this.state.tmpMB;
		mbUnits.banks = cont;
		this.setState({tmpMB:mbUnits, detL:detL})
	}
	cancel() {
		//////////console.log(['268', 'cancel'])
		var detL = this.state.detL;
		this.state.tmpMB.banks.forEach(function (b) {
			detL[b.mac]= b
		})
		this.setState({curModal:'add',detL:detL, tmpMB:{name:'NEW',type:'mb',banks:[]}})
	}
	submitMB(){
		var mbunits = this.state.mbunits;
		mbunits.push(this.state.tmpMB)

		this.saveSend(mbunits);
		this.setState({curModal:'add', tmpMB:{name:'NEW',type:'mb',banks:[]}})
	}
	submitMBe(){
		var mbunits = this.state.mbunits;
		mbunits[this.state.curIndex]= this.state.tmpMB 
		this.saveSend(mbunits);
		this.setState({curModal:'add', tmpMB:{name:'NEW',type:'mb',banks:[]}})
	}
	changeModalMode() {
		this.setState({curModal:'add'})
	}
	move(i,d) {
		var mbunits = this.state.mbunits
		if(d == 'up'){
			if(i != 0){
				var punit = mbunits[i-1];
				var unit = mbunits[i];
				mbunits[i] = punit;
				mbunits[i-1] = unit;
			}
		}else{
			if(i != (mbunits.length - 1)){
				var nunit = mbunits[i+1];
				var unit = mbunits[i];
				mbunits[i+1] = unit;
				mbunits[i] = nunit;
			}
		}
		this.setState({mbunits:mbunits});
	}
	saveSend(mbunits) {
		socket.emit('savePrefs', mbunits)
	}
	save() {
		socket.emit('savePrefs', this.state.mbunits)
	}
	loadPrefs() {
		//////////console.log('load prefs')
		if(socket.sock.readyState  ==1){
			//socket.emit('locateReq');
			socket.emit('getVersion');
			socket.emit('getPrefs');

		}
	}
	removeMb(i) {
		var mbunits = this.state.mbunits;
		var detL = this.state.detL
		mbunits[i].banks.forEach(function(b){
			detL[b.mac] = b
		})
		mbunits.splice(i,1);
		this.saveSend(mbunits)
		this.setState({mbunits:mbunits, detL:detL})
	}
	reset() {
		socket.emit('reset', 'reset requested')
	}
	renderModal() {
		var self = this;
		var mbSetup = this.state.mbunits.map(function(mb,ind) {
			//////////console.log(ind)
			return <MbSetup remove={self.removeMb} move={self.move} mb={mb} edit={self.editMb} index={ind} singleUnits={self.state.single}/>	// body...
		})
		var detList = this.state.dets.map(function(d){
			return d.name
		})
		
		if(this.state.curModal == 'edit'){
			var MB = this.renderMBGroup(0)
			return (<div>
				{MB}
			</div>)
		}else if(this.state.curModal == 'newMB'){
			var MB = this.renderMBGroup(1)
			return (<div>
				{MB}
			</div>)
		}else if(this.state.curModal == 'newSingle'){
			var MB = this.renderMBGroup(2)
			return (<div>
				{MB}
			</div>)
		}else{
			return (<div>
						<div className='prefInterface'>
								<button onClick={this.addNewMBUnit}>Add new MultiBankUnit</button>
								<button onClick={this.addNewSingleUnit}>Add new Single Unit</button>
								<button onClick={this.save}>Save Settings</button>
								<button onClick={this.loadPrefs}>Load Saved Settings </button>
								<button onClick={this.reset}>Reset Connections</button>
								<div className='mbManager'>
								{mbSetup}
						</div>
						</div>
						</div>)
		}
	}
	changetMBName(e) {
		e.preventDefault();
		if(this.state.mbunits)
		var MB = this.state.tmpMB
		if(typeof e == 'string'){
			MB.name = e
		}else{
			MB.name = e.target.value;
		
		}
		this.setState({tmpMB:MB})
	}
	editName(){
		this.refs.an.toggle();
	}
	renderMBGroup(mode) {
		var self = this;
		var submit;
		if(mode == 0){
			submit = (<button onClick={this.submitMBe}>Submit</button>)
		}else{
			submit = (<button onClick={this.submitMB}>Submit</button>)
		}

			var detectors = this.state.dets.map(function(det, i){
				if(self.state.detL[det.mac]){
						return (<DetItemView det={det} i={i} type={0} addClick={self.addToTmpGroup}/>)
				}
			})

			var MB = this.state.tmpMB; 
			var type = MB.type;
			var banks = MB.banks.map(function (b,i) {
					return(<DetItemView det={b} i={i} type={1} addClick={self.removeFromTmpGroup}/>)	
			})
			var nameEdit = <CustomKeyboard language={'english'}  onFocus={this.addFocus} onRequestClose={this.addClose} onChange={this.changetMBName} ref='an' value={MB.name} 
									onChange={this.onChange} num={false} label={'AlphaNumeric Keyboard - Hello'}/>
			return (<div><label>Name:</label><CustomLabel onClick={this.editName}>{MB.name}</CustomLabel>
					<table><tbody><tr>
					<th>Available Detectors</th><th>Banks</th>
					</tr><tr>
					<td style={{width:300, border:'1px solid black', minHeight:50}}>
					<div style={{maxHeight:350, overflowY:'scroll'}}>
						{detectors}
					</div>
					</td><td style={{width:300,  border:'1px solid black', minHeight:50, maxHeight:350, overflowY:'scroll'}}>
					<div style={{maxHeight:350, overflowY:'scroll'}}>
						{banks}
					</div>
					</td><td><div style={{height:30}}/></td></tr></tbody></table>
					{submit}<button onClick={this.cancel}>Cancel</button>
					{nameEdit}
					</div>)
	}
	showLogin(){
		this.refs.logIn.toggle();
	}
	showLogs() {
		// body...
		this.refs.logModal.toggle()
	}
	
	onChange(argument) {
		// body...
		//////console.log(argument)
	}
	showDisplaySettings(){
		this.refs.dispModal.toggle();
	}
	updateDisply(){
		socket.emit('updateDisplay')
	}
	renderLanding() {
		var self = this;
		var detectors = this.renderDetectors()
		var config = 'config'
		var find = 'find'
		var login = 'login'

		var lstyle = {height: 72,marginRight: 20}
		if(!this.state.minW){
			lstyle = { height: 60, marginRight: 15}
		}
		var mbunits = this.state.mbunits.map(function(mb,i){
			if(mb.type == 'mb'){
				return <MultiBankUnit onSelect={self.switchUnit} ref={'mbu' + i} name={mb.name} data={mb.banks}/>	
			}else{
				if(mb.banks[0]){
					//////////console.log('457')
					return <SingleUnit ref={mb.banks[0].mac} onSelect={self.switchUnit} unit={mb.banks[0]}/>	
				}						
			}
			
		})
		
		var modalContent = this.renderModal();
		return (<div className = 'landingPage'>
					<table className='landingMenuTable'>
						<tbody>
							<tr>
								<td><img style={lstyle} onClick={this.showNKeyboard}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
								<td className="buttCell" hidden><button onClick={this.showLogs} className={find}/></td>
								
							
								<td className="buttCell"><button onClick={this.showFinder} className={find}/></td>
								<td className="buttCell"><button onClick={this.showDisplaySettings} className={config}/></td>
							</tr>
						</tbody>
					</table>
					<Modal ref='findDetModal' innerStyle={{background:'#e1e1e1'}}>
						{modalContent}
					</Modal>
					<Modal ref='dispModal' innerStyle={{background:'#e1e1e1'}}>
						<DispSettings nif={this.state.nifip} nm={this.state.nifnm} gw={this.state.nifgw} version={this.state.version}/>
						<CustomAlertButton alertMessage={'Update display?'} style={{color:'#000000'}} onClick={this.updateDisply}>Update Display</CustomAlertButton>
					</Modal>
					<Modal ref='logModal'>
					<LogView netpolls={this.state.netpolls}/>
					</Modal>
				 	{detectors}
				 	{mbunits}

					<Modal ref='updateModal'>
						<div style={{color:'#e1e1e1'}}>
							<div>Updating Display...</div>
							<div>{this.state.progress}</div>
						</div> 
					</Modal>
			</div>)	
	}
	renderDetector() {
		//for kraft CIP
		var kraft = false;
		if(vdefByMac[this.state.curDet.mac][0]['@defines']['KRAFT_CIP']){
			kraft = true;
		}
		return (<DetectorView kraft={kraft}  nifip={this.state.nifip} nifnm={this.state.nifnm} nifgw={this.state.nifgw} br={this.state.brPoint} ref='dv' acc={this.state.level} accounts={this.state.accounts} logoClick={this.logoClick} det={this.state.curDet} ip={this.state.curDet.ip} mac={this.state.curDet.mac} netpolls={this.state.netpolls[this.state.curDet.ip]}/>)
		
	}
	
	
	onLoginFocus(){
		this.refs.logIn.setState({override:true})
	}
	onLoginClose(){
		var self = this;
		setTimeout(function(){
			self.refs.logIn.setState({override:false})	
		}, 100)
		
	}
	addFocus(){
		this.refs.findDetModal.setState({override:true})
	}
	addClose(){
		var self = this;
		setTimeout(function(){
			self.refs.findDetModal.setState({override:false})	
		}, 100)
	}
	dummy() {
		// body...
		//////console.log('dummy')
	}
	render() {
		var cont;
		var style = {minWidth: 290,userSelect: 'none', maxWidth: 1028,marginLeft: 'auto', marginRight:'auto', backgroundColor:"#e1e1e1"}
		//var hd = window.matchMedia("(min-width:1900px)").matches;


		if(this.state.currentPage == 'landing'){
			//////////console.log('here')
			cont = this.renderLanding();


		}else if(this.state.currentPage == 'detector'){
			cont = this.renderDetector();
			style =  {backgroundColor:"#362c66", boxShadow:"0px 19px #362c66"}
		}
		
		return (
			
			<div style={style}>
		
			{cont}
			
		</div>
		)
	}
}
class DispSettings extends React.Component{
	constructor(props){
		super(props)
		this.onChange = this.onChange.bind(this);
		this.onChangeNM = this.onChangeNM.bind(this);
		this.onChangeGW = this.onChangeGW.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onClickNM = this.onClickNM.bind(this);
		this.onClickGW = this.onClickGW.bind(this);
	}
	onChange(v){
		socket.emit('nifip', v);
	}
	onChangeNM(v){
		socket.emit('nifnm', v);
	}
	onChangeGW(v){
		socket.emit('nifgw', v);
	}
	onRequestClose(){

	}
	onFocus(){

	}
	onClick(){
		this.refs.ip.toggle();
	}
	onClickNM(){
		this.refs.nm.toggle();
	}
	onClickGW(){
		this.refs.gw.toggle();
	}
	render(){
		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
			var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}

		return <div>
	<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#000"}} >
	<div style={{display:'inline-block', textAlign:'center'}}>Display Settings</div></h2></span>
		
			 <div className='sItem noChild' onClick={this.onClick}>
			 <label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Display IP'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.props.nif}</label></div></div>
			</div>
			 <div className='sItem noChild' onClick={this.onClickNM}>
			 <label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Display Netmask'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.props.nm}</label></div></div>
			</div>
			 <div className='sItem noChild' onClick={this.onClickGW}>
			 <label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Display Gateway'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.props.gw}</label></div></div>
			</div>
			<div className='sItem noChild'>
			 <label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Display Version'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.props.version}</label></div></div>
			</div>
			<CustomKeyboard language={'english'} pwd={false} vMap={this.props.vMap}  onFocus={this.onFocus} ref={'ip'} onRequestClose={this.onRequestClose} onChange={this.onChange} index={0} value={this.props.nif} num={true} label={'Address'}/>
			<CustomKeyboard language={'english'} pwd={false} vMap={this.props.vMap}  onFocus={this.onFocus} ref={'nm'} onRequestClose={this.onRequestClose} onChange={this.onChangeNM} index={0} value={this.props.nm} num={true} label={'Address'}/>
			<CustomKeyboard language={'english'} pwd={false} vMap={this.props.vMap}  onFocus={this.onFocus} ref={'gw'} onRequestClose={this.onRequestClose} onChange={this.onChangeGW} index={0} value={this.props.gw} num={true} label={'Address'}/>

		</div>
	}

}
class LogView extends React.Component{
	constructor(props) {
		super(props)
		this.state = {netpolls:this.props.netpolls}
	}
	componentWillReceiveProps(newProps) {
		this.setState({netpolls:newProps.netpolls})	// body...
	}
	render() {
		// body...
		var dets = [];
		for(var d in this.state.netpolls){
			var evs = this.state.netpolls[d].map(function (e) {
				// body...			
			var ev = e.net_poll_h;
			if(netMap[e.net_poll_h]){
				ev = netMap[e.net_poll_h]['@translations']['english']	
			}
			var dateTime = e.date_time.year + '/' + e.date_time.month + '/' + e.date_time.day + ' ' + e.date_time.hours+ ':' + e.date_time.min + ':' + e.date_time.sec;
			var rejects = e.rejects
			var faults = e.faults

			var string = 'rejects:' + rejects.number + ', signal:' + rejects.signal;
			if((e.net_poll_h == 'NET_POLL_PROD_REC_VAR')||(e.net_poll_h == 'NET_POLL_PROD_SYS_VAR')){
				string = e.parameters[0].param_name + ': ' + e.parameters[0].value
			}

				return (<tr><td>{dateTime}</td><td>{ev}</td><td>{string}</td></tr>)
			})
			var tab = (<table className='npTable'><tbody>
				{evs}
				</tbody></table>)
			if(this.state.netpolls[d].length == 0){
				tab = <label>No Logs availble</label>
			}
			var node = (<TreeNode hide={false} nodeName={'Detector at ' +d}>
				{tab}
			</TreeNode>)
			dets.push(node)
		}
		return( <div>
			<div>Logs for all detectors</div>
			{dets}
		</div>)
	}
}


class LogInControl extends React.Component{
	constructor(props){
		super(props)
		this.login = this.login.bind(this)
		this.logout = this.logout.bind(this);
		this.selectChanged = this.selectChanged.bind(this);
		var list = []
		this.props.accounts.forEach(function(ac){
			list.push(ac.username)
		})
		list.unshift('Not Logged In')
		this.state = {val:0, list:list, showAcccountControl:false, open:false}
		this.enterPIN = this.enterPIN.bind(this);
		this.valChanged = this.valChanged.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.toggleAccountControl = this.toggleAccountControl.bind(this);
	}
	componentWillReceiveProps(props){
		var list = []
		props.accounts.forEach(function(ac){
			list.push(ac.username)
		})
		list.unshift('Not Logged In')
		if(!this.props.isOpen){

			this.setState({val:props.val, list:list})
		}else{
			//console.log('this was the issue... why Though?')
			this.setState({list:list})
		}
		
	}
	componentDidMount(){
		this.setState({showAcccountControl:false})
	}
	login(){
		var self = this;
		setTimeout(function(){self.refs.pw.toggleCont()},100)
		
	}
	logout(){
		this.props.logout();
	}
	selectChanged(v,i){
		//////console.log(['1531',v])
		var self = this;
		setTimeout(function(){
			self.setState({val:v})
		}, 100)
		
		if(v != 0){
			this.enterPIN()
			
		}


		//this.props.login(v)
	}
	enterPIN(){
		this.refs.psw.toggle();
	}
	onFocus(){
		this.setState({open:true})
	}
	onRequestClose(){
		this.setState({open:false})
	}
	valChanged(v){
		////console.log(v)
		//this.props.authenticate(this.state.list[this.state.val], v)
		//console.log(this.state.val)
		if(this.props.pass6 == 0){
			if(v.length == 6){
				this.props.authenticate(this.state.val,v)
			}else{
				toast('Password should be 6 characters')
			}
		}else{
			if(v.length == 4){
				this.props.authenticate(this.state.val,v)
			}else{
				toast('Password should be 4 characters')
			}
		}
		
	}
	toggleAccountControl(){
		if(this.props.level > 2){
			this.setState({showAcccountControl:!this.state.showAcccountControl})
		}else{
			toast('Access Denied')
		}
//		return 	<AccountControl accounts={this.props.accounts} language={this.props.language} login={this.login} val={this.state.level}/>
		
	}

	render(){
		//TODO
		var list = this.state.list
		var logoutbutton = '' 	
		if(this.props.val != 0){
			logoutbutton = (<div><button className='customAlertButton' onClick={this.logout}>Log Out</button></div>)
		}
		
		var namestring = 'Select User'
		var pw = <PopoutWheel vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={namestring} ref='pw' val={[this.props.val]} options={[list]} onChange={this.selectChanged}/>
		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
			var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}

		    
		var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26,fontWeight:500, color:"#eee"}} >
			<div style={{display:'inline-block', textAlign:'center'}}>Accounts</div></h2></span>)
		var clr = "#e1e1e1"
		var actrl =  (<div className='sItem noChild' onClick={this.login}>
			<label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'User'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{list[this.props.val]}</label></div></div>
			</div>)
		if(this.state.showAcccountControl){
			actrl = <AccountControl level={this.props.level} accounts={this.props.accounts} ip={this.props.ip} language={this.props.language} login={this.login} val={this.state.level}/>
			clr = 'orange'	
		}
		var tosns = <div style={{position:'absolute', display:'block', width:860, textAlign:'right'}}><div  onClick={this.toggleAccountControl}  style={{top:65}}>
		<div style={{display:'inline-block', verticalAlign:'top', paddingTop:5, paddingLeft:20, color:clr}}> {vdefMapV2['@labels']['Settings'][this.props.language].name} </div> 
		<div style={{display:'inline-block'}}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={clr}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg></div></div>
		</div>	
		
		return <div style={{position:'relative'}}>{pw}
			<CustomKeyboard language={this.props.language} pwd={true} vMap={this.props.vMap}  onFocus={this.onFocus} ref={'psw'} onRequestClose={this.onRequestClose} onChange={this.valChanged} index={0} value={''} num={true} label={'Password'}/>
		{tosns}
		<div>
		{titlediv}
		
		</div>
			{actrl}
			{logoutbutton}
		</div> 
	}
}
class LogInControl2 extends React.Component{
	constructor(props){
		super(props)
		this.login = this.login.bind(this)
		this.logout = this.logout.bind(this);
		this.selectChanged = this.selectChanged.bind(this);
		var list = []
		this.props.accounts.forEach(function(ac){
			list.push(ac.username + ' - lv' + ac.acc)
		})
		list.unshift('Not Logged In')
		this.state = {val:0, list:list, showAcccountControl:false, open:false}
		this.enterPIN = this.enterPIN.bind(this);
		this.valChanged = this.valChanged.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.toggleAccountControl = this.toggleAccountControl.bind(this);
		this.onCancel = this.onCancel.bind(this);
	}
	componentWillReceiveProps(props){
		var list = []
		props.accounts.forEach(function(ac){
			list.push(ac.username + ' - lv' + ac.acc)
		})
		list.unshift('Not Logged In')
		if(!this.props.isOpen){

			this.setState({val:props.val, list:list})
		}else{
			//console.log('this was the issue... why Though?')
			this.setState({list:list})
		}
		
	}
	componentDidMount(){
		this.setState({showAcccountControl:false})
	}
	login(){
		var self = this;
		setTimeout(function(){
			self.refs.pw.toggleCont();
			self.setState({open:true})
		},100)
		
	}
	logout(){
		this.props.logout();
	}
	selectChanged(v,i){
		//console.log(['1531',v])
		var self = this;
		setTimeout(function(){
			if(v != 0){
			self.refs.psw.toggle();			
		}

		}, 100)
		self.setState({val:v})
		

		//this.props.login(v)
	}
	enterPIN(){
		this.refs.psw.toggle();
	}
	onFocus(){
		this.setState({open:true})
	}
	onRequestClose(){
		var self = this;
		this.setState({open:false})
		setTimeout(function(){
			self.props.onRequestClose();
		},100)
			
	}
	valChanged(v){
		////console.log(v)
		//this.props.authenticate(this.state.list[this.state.val], v)
		//console.log(this.state.val)
		if(this.props.pass6 == 0){
			if(v.length == 6){
				this.props.authenticate(this.state.val,v)
			}else{
				toast('Password should be 6 characters')
			}
		}else{
			if(v.length == 4){
				this.props.authenticate(this.state.val,v)
			}else{
				toast('Password should be 4 characters')
			}
		}
		
	}
	toggleAccountControl(){
		if(this.props.level > 2){
			this.setState({showAcccountControl:!this.state.showAcccountControl})
		}else{
			toast('Access Denied')
		}
//		return 	<AccountControl accounts={this.props.accounts} language={this.props.language} login={this.login} val={this.state.level}/>
		
	}
	onCancel(){
		//console.log('on cancel')
		var self = this;
		this.setState({open:false})
		setTimeout(function(){
			self.props.onRequestClose();
		},100)
			
	}

	render(){
		var list = this.state.list
		var namestring = 'Select User'
		var pw = <PopoutWheel mobile={this.props.mobile} vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={namestring} ref='pw' val={[this.props.val]} options={[list]} onChange={this.selectChanged} onCancel={this.onCancel}/>

		return <React.Fragment>{pw}
			<CustomKeyboard mobile={this.props.mobile} language={this.props.language} pwd={true} vMap={this.props.vMap}  onFocus={this.onFocus} ref={'psw'} onRequestClose={this.onRequestClose} onChange={this.valChanged} index={0} value={''} num={true} label={'Password'}/>
		
		</React.Fragment> 
	}
}
class TickerBox extends React.Component{
	constructor(props) {
		super(props)
		this.state = {ticks:0}
		this.update = this.update.bind(this);
	}
	update(data) {
		this.setState({ticks:data})
	}
	render(){
		var tickerVal= this.state.ticks;
		if(Math.abs(tickerVal)<50){
			tickerVal = 0;
		}else if(tickerVal>0){
			tickerVal = tickerVal - 50;
		}else{
			tickerVal = tickerVal + 50
		}
		var color = 'green';
		if(this.props.color){
			color = this.props.color
		}
		if(Math.abs(tickerVal)>50){
			color = 'red';
		}
		if(tickerVal>200){
			tickerVal = 200;
		}else if(tickerVal < -200){
			tickerVal = -200
		}
		var path = 'example_path'
		var block = 'example_block'
		if(this.props.int){
			path = 'example_path_i'
			block = 'example_block_i'
		}
		return (
			<div className='tickerBox'>
			<div className={path}>
				<div className={block} style = {{left:50-(tickerVal/4)+'%',backgroundColor:color}}/>
			</div>
			</div>
		)
	}
}

class LEDBar extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({pled:0, dled:0})
		this.update = this.update.bind(this)
	}
	update(p,d) {
		if((this.state.pled != p) || (this.state.dled != d)){
			this.setState({pled:p, dled:d})
		}
	}
	render(){
		var rej = 'black';
		var prod = 'black';
		var fault = 'black';
			if(this.state.pled == 1){
			prod = 'green';
		}else if(this.state.pled == 2){
			prod = 'red'
		}
		if(this.state.dled == 1){
			rej = 'red'
		}
		return(<div className='ledBar' >
				<table><tbody><tr><td style={{width:'17px'}}><LEDi color={rej}/><LEDi color={rej}/></td><td>Detection</td><td className='txtLeft'>Product:</td><td style={{width:'17px'}}><LEDi color={prod}/><LEDi color={prod}/></td></tr></tbody></table>
			</div>
			)
	}
}
class LEDBarInt extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({pled_a:0, dled_a:0,pled_b:0, dled_b:0})
		this.update = this.update.bind(this)
	
	}
	update(pa,pb,da,db) {
		// body...
		if((this.state.pled_a != pa) || (this.state.dled_a != da)||(this.state.pled_b != pb) || (this.state.dled_b != db)){
			this.setState({pled_a:pa, dled_a:da,pled_b:pb, dled_b:db})
		}
	}
	render(){
		var rej_a = 'black';
		var rej_b = 'black';
		
		var prod_a = 'black';
		var prod_b = 'black';
		
		var fault = 'black';
			if(this.state.pled_a == 1){
			prod_a = 'green';
		}else if(this.state.pled_a == 2){
			prod_a = 'red'
		}
		if(this.state.dled_a == 1){
			rej_a = 'red'
		}
			if(this.state.pled_b == 1){
			prod_b = 'green';
		}else if(this.state.pled_b == 2){
			prod_b = 'red'
		}
		if(this.state.dled_b == 1){
			rej_b = 'red'
		}
		return(<div className='ledBar' >
				<table><tbody><tr><td style={{width:'17px'}}><LEDi color={rej_a}/><LEDi color={rej_b}/></td><td>Detection</td><td className='txtLeft'>Product:</td><td style={{width:'17px'}}><LEDi color={prod_a}/><LEDi color={prod_b}/></td></tr></tbody></table>
			</div>
			)
	}
}
class LEDi extends React.Component{
	constructor(props) {
		super(props)
	}
	render(){
		return(<div className='ledi' style={{ backgroundColor:this.props.color}}/>)
	}
}

class MobLiveBar extends React.Component{
	constructor(props) {
		super(props)
		this.update = this.update.bind(this)
		this.setLEDs = this.setLEDs.bind(this)
	
	}
	setLEDs(a,b,c,d) {
		if(this.props.int){
			this.refs.st.setLEDs(a,c,b,d)

		}
		else{
			this.refs.st.setLEDs(a,b)
			// body...
		}
	}
	update(a,b) {
		this.refs.st.update(a,b)
	}
	render() {
		var st=<StatBar ref='st' />
		if(this.props.int){
			st = <StatBarInt style={{marginTop:12}} ref='st'/>
		}
		return(<div className="mobLiveBar">{st}</div>)
	}
}


class FaultItem extends React.Component{
	constructor(props) {
		super(props)
	}
	render(){
		var type = this.props.fault
		return <div><label>{"Fault type: " + type}</label>
		</div>
	}
}


class SettingsDisplay2 extends React.Component{
	constructor(props) {
		super(props)
		this.mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 467px)'),
			window.matchMedia('(min-width: 600px)')
		]
		for (var i=0; i<3; i++){
			this.mqls[i].addListener(this.listenToMq)
		}
		var font = 0;
		if(this.mqls[2].matches){
			font = 2
		}else if(this.mqls[1].matches){
			font = 1
		}

		this.state = ({
		 sysRec:this.props.sysSettings, prodRec:this.props.prodSettings, dynRec:this.props.dynSettings,font:font, data:this.props.data, cob2:this.props.cob2, framRec:this.props.framRec
		});
		this.handleItemclick = this.handleItemclick.bind(this);
		this.scrollUp = this.scrollUp.bind(this);
		this.scrollDown = this.scrollDown.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.sendPacket = this.sendPacket.bind(this);
		this.parseInfo = this.parseInfo.bind(this);
		this.activate = this.activate.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.listenToMq = this.listenToMq.bind(this);
		//this.componentDidMount = this.component
	}
	componentWillUnmount(){
		
		for (var i=0; i<3; i++){
			this.mqls[i].removeListener(this.listenToMq)
		}
	}
	componentWillReceiveProps(newProps){
		this.setState({data:newProps.data, cob2:newProps.cob2, sysRec:newProps.sysSettings, prodRec:newProps.prodSettings, dynRec:newProps.dynSettings, framRec:newProps.framRec})
	}
	listenToMq() {
		if(this.mqls[2].matches){
			this.setState({font:2})
		}else if(this.mqls[1].matches){
			this.setState({font:1})
			
		}else if(this.mqls[0].matches){
			this.setState({font:0})
		}
	}
	handleItemclick(dat, n){		

		this.props.onHandleClick(dat, n);
	}
	parseInfo(sys, prd){
		if((typeof sys != 'undefined') && (typeof prd != 'undefined')){
			if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){
				this.setState({sysRec:sys, prodRec:prd})
			}
		}
	}
	componentDidMount() {
		this.props.sendPacket('refresh',0);
		//window.addEventListener('scroll', this.handleScroll)
	}
	
	handleScroll(ev) {
		// body...
		////////console.log(ev.srcElement.body)
		var lvl = this.props.data.length
		var len = 0;
		if(lvl > 0){
			len = this.props.data[lvl - 1 ][0].params.length
		}
		//	//////console.log(document.getElementById(this.props.Id).scrollTop)
		if(len > 6){
			if((document.getElementById(this.props.Id).scrollTop) + 390 < len*65){
				this.refs.arrowBot.show();
				////////console.log(['show arrow',document.getElementById(this.props.Id).scrollTop])
			}else{
				this.refs.arrowBot.hide();	
				////////console.log(document.getElementById(this.props.Id).scrollTop)
			} 
			if(document.getElementById(this.props.Id).scrollTop > 5){
				this.refs.arrowTop.show();
			}else{
				this.refs.arrowTop.hide();
			}
		}
		////////console.log(document.getElementById(this.props.Id));
	}
	scrollUp() {
		// body...
		_scrollById(this.props.Id,-260,300);
	}
	scrollDown() {
		// body...
		_scrollById(this.props.Id,260,300);
		//setScrollTop(this.props.Id, document.getElementById(this.props.Id).scrollTop + 200)
	}
	sendPacket(n,v) {
		var self = this;
		//console.log([n,v])
		if(n['@rpcs']['toggle']){

			var arg1 = n['@rpcs']['toggle'][0];
			var arg2 = [];
			for(var i = 0; i<n['@rpcs']['toggle'][1].length;i++){
				if(!isNaN(n['@rpcs']['toggle'][1][i])){
					arg2.push(n['@rpcs']['toggle'][1][i])
				}else{
					arg2.push(v)
				}
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2);
			
			socket.emit('rpc', {ip:this.props.dsp, data:packet})
		}else if(n['@rpcs']['apiwrite']){
			var arg1 = n['@rpcs']['apiwrite'][0];
			var arg2 = [];
			var strArg = null;
			for(var i = 0; i<n['@rpcs']['apiwrite'][1].length;i++){
				if(!isNaN(n['@rpcs']['apiwrite'][1][i])){
					arg2.push(n['@rpcs']['apiwrite'][1][i])
				}else if(n['@rpcs']['apiwrite'][1][i] == n['@name']){
					if(!isNaN(v)){
						arg2.push(v)
					}else{
						strArg=v
						
					}
				}
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
				
			socket.emit('rpc', {ip:this.props.dsp, data:packet})
		}else if(n['@rpcs']['write']){
			var arg1 = n['@rpcs']['write'][0];
			var arg2 = [];
			var strArg = null;
			var flag = false
				//console.log('2281',v, n['@rpcs']['write'][1], n["@name"])
			for(var i = 0; i<n['@rpcs']['write'][1].length;i++){
				if(!isNaN(n['@rpcs']['write'][1][i])){
					//console.log('where')
					arg2.push(n['@rpcs']['write'][1][i])
				}else if(n['@rpcs']['write'][1][i] == n['@name']){
					//console.log('the')
					if(!isNaN(v)){
						arg2.push(v)
					}
					else{
						arg2.push(0)
						strArg=v
					}
					flag = true;
				}else{
					//console.log('fuck')
					var dep = n['@rpcs']['write'][1][i]
					if(dep.charAt(0) == '%'){

					}
				}
			}
			if(n['@rpcs']['write'][2]){
				if(Array.isArray(n['@rpcs']['write'][2])){
					strArg = n['@rpcs']['write'][2]
				}
				else if(typeof n['@rpcs']['write'][2] == 'string'){
					strArg = v
				}
				flag = true;
			}
			if(!flag){
				strArg = v;
			}
			//console.log(['1917',arg1, arg2,strArg,v])
		
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
				
			socket.emit('rpc', {ip:this.props.dsp, data:packet})
		}else if(n['@rpcs']['clear']){
			var packet = dsp_rpc_paylod_for(n['@rpcs']['clear'][0], n['@rpcs']['clear'][1],n['@rpcs']['clear'][2]);
				
			socket.emit('rpc', {ip:this.props.dsp, data:packet})
		}
	}
	activate(n) {
		// body...
		var self = this;
		//////console.log(['1466',n,this.props.cob2,this.props.data])
		var list; 
		if(this.props.data.length > 1){
			list 	= this.props.data[this.props.data.length - 1][0].params
		}else{
			list = this.props.data[0][0].params
		}
	
		list.forEach(function(p){
			if(p['@name'] != n['@name']){
				if(self.refs[p['@name']]){
					self.refs[p['@name']].deactivate();
				}
			}
		});
	}
	onFocus() {
		// body...
			this.props.setOverride(true)
	}
	onRequestClose() {
		// body...
		var self = this;
			setTimeout(function () {
				// body...
				self.props.setOverride(false)
			},100)
			
	}
	render(){
		var self = this;
		var data = this.props.data
		////console.log(2366,'render')
		//var catMap = vdefByMac[this.props.dsp][]
		//////////console.log(data)
		var lvl = data.length 
		var handler = this.handleItemclick;
		var lab = vdefMapV2['@labels']['Settings'][this.props.language]['name']
		var cvdf = this.props.cvdf
		//////////console.log(lvl)
		var label =vdefMapV2['@labels']['Settings'][this.props.language]['name']

		var nodes;
		var ft = 25;
		if(this.state.font == 1){
			ft = 20
		}else if(this.state.font == 0){
			ft = 18
		}
		var backText = vdefMapV2['@labels']['Back'][this.props.language].name
		if(this.props.mobile){
			backText = ''
		}
		var nav =''
		var backBut = ''

		var catList = [	]

		var accLevel = 0;
		var accMap = {'Sensitivity':'PassAccSens', 'Calibration':'PassAccCal', 'Other':'PassAccProd', 
			'Faults':'PassAccClrFaults','Rej Setup':'PassAccClrRej'}
		var len = 0;
		var SA = false;
		if(lvl == 0){
			nodes = [];
			for(var i = 0; i < catList.length; i++){
				var ct = catList[i]
				nodes.push(<SettingItem3 mobile={this.props.mobile} mac={this.props.mac} language={self.props.language}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} ioBits={this.props.ioBits} path={'path'} ip={self.props.dsp} ref={ct} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} lkey={ct} name={ct} hasChild={true} data={[this.props.cob2[i],i]} onItemClick={handler} hasContent={true} sysSettings={this.state.sysRec} prodSettings={this.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
			}
			len = catList.length;
			nav = nodes;
		}else{

			var cat = data[lvl - 1 ][0].cat;
			var pathString = ''
			lab = cat//catMap[cat]['@translations']['english']
			if(lvl == 1){
		    	
		    	if(this.props.mode == 'config'){
		    		label = vdefMapV2['@labels']['Settings'][this.props.language]['name']
		    		pathString = ''
		    	}else{
		    		label = catMapV2[data[0][0].cat]['@translations'][this.props.language]
		    		pathString = data[0][0].cat
		    	}
		    	//catMap[data[0]]['@translations']['english']
		    }else if(lvl == 2){
		    	if(this.props.mode == 'config'){
		    		pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
		    		label = catMapV2[pathString]['@translations'][this.props.language];
		    	}else{
		    		pathString = data.map(function (d) {return d[0].cat}).join('/')
		    		label = catMapV2[pathString]['@translations'][this.props.language];
		    	}
		    
					backBut = (<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5, width:32}} src='assets/return.svg'/>
						<label style={{color:'#ccc', fontSize:ft}}>{backText}</label></div>)
			
		    }else{
		    	var bblab = ''
		    	if(this.props.mode == 'config'){
		    		pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
		    		////console.log(pathString)
		    		label = catMapV2[pathString]['@translations'][this.props.language];
		    		bblab = catMapV2[data.slice(1,data.length - 1).map(function (d) {return d[0].cat}).join('/')]['@translations'][this.props.language]; 
		    	}else{
		    		pathString = data.map(function (d) {return d[0].cat}).join('/')
		    		label = catMapV2[pathString]['@translations'][this.props.language];
		    		bblab = catMapV2[data.slice(0,data.length - 1).map(function (d) {return d[0].cat}).join('/')]['@translations'][this.props.language]; 
		    	}
		    	backBut = (<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5, width:32}} src='assets/return.svg'/>
		    		<label style={{color:'#ccc', fontSize:ft}}>{backText}</label></div>)
				
		    	 
		    	
		    }
			nodes = []
		/*	data[lvl - 1 ][0].subCats.forEach(function(sc,i){
			nodes.push(<SettingItem2 language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} faultBits={self.props.faultBits} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={sc.cat} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
					data={[sc,i]} onItemClick={handler} hasContent={true} acc={self.props.accLevel>=accLevel} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec}/>)
			})*/
			data[lvl - 1 ][0].params.forEach(function (par,i) {
				// body...
			//	//////console.log(['1986',par])
				if(par.type == 0){
			//		////console.log("Is this the problem")
					var p = par

					var ind = 0;
					var prms = self.props.cob2[ind].params;
					////////console.log(['1991',prms,data])
					//var sbc = self.props.cob2[ind].subCats;
					while(ind < lvl - 1){
						ind = ind + 1
						prms = prms[data[ind][1]]['@data'].params
					//	//////console.log(['1996',prms])
					//	sbc = sbc[data[ind][1]].subCats;	
					}
					var d = prms[i]
					var ch = d['@children']
				var	acc = false;
				//////console.log(p)
				// accessControl
					if((self.props.level > 3) || (p.acc <= self.props.level)){
						acc = true;
					}
				//	////console.log(['2063',d])
			//		self.props.level accLevel
					nodes.push(<SettingItem3 mobile={self.props.mobile} mac={self.props.mac} language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} 
						ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={p['@name']} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={p['@name']} name={p['@name']} 
							children={[vdefByMac[self.props.mac][5][p['@name']].children,ch]} hasChild={false} data={d} onItemClick={handler} hasContent={true}  acc={acc} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec}/>)
					
				}else if(par.type == 1){
					var sc = par['@data']
							var	acc = false;
							//////console.log(['2046',par])
					// accessControl
					if((self.props.level > 3) || (par.acc <= self.props.level)){
						acc = true;
					}
					if(typeof sc['child'] != 'undefined'){
						var spar = sc.params[sc.child]
						var ch = spar['@children']
							nodes.push(<SettingItem3 mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={sc.cat} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
					data={[sc,i]} children={[vdefByMac[self.props.mac][5][spar['@name']].children,ch]} onItemClick={handler} hasContent={true} acc={acc} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
			
					}else{
		
						nodes.push(<SettingItem3 mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={sc.cat} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
						data={[sc,i]} onItemClick={handler} hasContent={true} acc={acc} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
					}
				}else if(par.type == 2){
					var sc = par['@data']
							var	acc = false;
							//console.log(['2146',par])
				
					if((self.props.level > 3)){
						acc = true;
					}
					if(typeof sc['child'] != 'undefined'){
						var spar = sc.params[sc.child]
						var ch = spar['@children']
							nodes.push(<SettingItem3 mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={sc.cat} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
					data={[sc,i]} backdoor={true} children={[vdefByMac[self.props.mac][5][spar['@name']].children,ch]} onItemClick={handler} hasContent={true} acc={acc} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
			
					}else{
		
						nodes.push(<SettingItem3 mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={sc.cat} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
						data={[sc,i]} backdoor={true} onItemClick={handler} hasContent={true} acc={acc} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
					}
				}
			})
			len = data[lvl - 1 ][0].params.length;
			var ph = ""
			if(len > 6){
				ph = <div style={{display:'block', width:500, height:20}}></div>
				SA = true;
			}
			nav = (
				<div className='setNav' onScroll={this.handleScroll} id={this.props.Id}>
					{nodes}
					{ph}
				</div>)
		}

		var className = "menuCategory expanded";
	   	var tstl = {display:'inline-block', textAlign:'center'}
	    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#eee"}} >{backBut}<div style={tstl}>{label}</div></h2></span>)
	    if (this.state.font == 1){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:26, marginTop: -5,fontWeight:500, color:"#eee"}} >{backBut}<div style={tstl}>{label}</div></h2></span>)
	    }else if (this.state.font == 0){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:24, marginTop: -5,fontWeight:500, color:"#eee"}} >{backBut}<div style={tstl}>{label}</div></h2></span>)
	    }
	    catList = null;

		return(
			<div className='settingsDiv'>
			<ScrollArrow ref='arrowTop' offset={72} width={72} marginTop={5} active={SA} mode={'top'} onClick={this.scrollUp}/>
		
			<div className={className}>
							{titlediv}
			
							{nav}
			</div>
			<ScrollArrow ref='arrowBot' offset={72} width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
			</div>
		);
	}
	
}
class ScrollArrow extends React.Component{
	constructor(props) {
		super(props)
		// body...
		if(this.props.mode == 'top'){
			this.state = {visible:false}
		}else{
			this.state = {visible:true}
		}
		this.hide = this.hide.bind(this)
		this.show = this.show.bind(this)
		this.onClick = this.onClick.bind(this);
	}
	hide() {
		// body...
		if(this.state.visible){
			this.setState({visible:false})
		}
	}
	show () {
		// body...
		if(!this.state.visible){
			this.setState({visible:true})
		}
	}
	onClick () {
		// body...
		if(this.props.onClick){
			this.props.onClick();
		}
	}
	render () {
		// body...
		if(this.props.mode == 'top'){
			return <div className='scrollArrow' hidden={!(this.props.active && this.state.visible)}>
						<svg onClick={this.onClick} style={{position:'fixed',zIndex:2,marginTop:this.props.marginTop,marginLeft:this.props.width/-2,marginRight:'auto',width:this.props.width,height:this.props.width, strokeWidth:'2%'}} xmlns="http://www.w3.org/2000/svg" fill="#e1e1e1" viewBox="0 0 24 24" ><path stroke="#000"  d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>								
					</div>
		}
		return <div className='scrollArrow' hidden={!(this.props.active && this.state.visible)}>
			<svg onClick={this.onClick} style={{position:'fixed',zIndex:2,marginTop:this.props.marginTop, marginLeft:this.props.width/-2,marginRight:'auto',width:this.props.width,height:this.props.width, strokeWidth:'2%'	}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e1e1e1"><path stroke="#000"  d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"/></svg>								
		</div>
	}
		
}
/*Input Controls Begin*/
class SettingItem2 extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({mode:0,font:this.props.font})
		this.sendPacket = this.sendPacket.bind(this);
		this.onItemClick = this.onItemClick.bind(this);
		this.activate = this.activate.bind(this);
		this.deactivate = this.deactivate.bind(this);
		this.getValue = this.getValue.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose =this.onRequestClose.bind(this);
	}

	sendPacket(n,v) {
		//
		var val = v
		if(n['@name'] == 'Nif_ip'){
			//console.log(v.toString())
			socket.emit('nifip', v.toString())
		}else if(n['@name'] == 'Nif_nm'){
			//console.log(v.toString())
			socket.emit('nifnm', v.toString())
		}else if(n['@name'] == 'Nif_gw'){
			//console.log(v.toString())
			socket.emit('nifgw', v.toString())
		}else{

		//}
		 if(n['@type'] == 'ipv4_address'){
			val = v.split('.').map(function(ip){
				return ("000"+ip).slice(-3);
			}).join('.')
			setTimeout(function(){
				socket.emit('locateReq');
			},200)
		}
		this.props.sendPacket(n,val)	
		}
	}
	componentWillReceiveProps (newProps) {
		// body...
		this.setState({font:newProps.font})
	}
	onItemClick(){

		if(this.props.hasChild || typeof this.props.data == 'object'){
			//////console.log([this.props.data])
			// accessControl
			if(this.props.acc){
				this.props.onItemClick(this.props.data, this.props.name)	
			}else{

				toast('Access Denied')	
				}		
			}
	}
	activate () {
		this.props.activate(this.props.data)
	}
	deactivate () {
		// body...
		if(this.refs.ed){
			this.refs.ed.deactivate()
		}		
	}
	getValue(rval, pname){
		var pram;
			var val;
			var label = false
			var res = vdefByMac[this.props.mac];
			var pVdef = _pVdef;
			var dec = 0;
			var self = this;
			if(res){
				pVdef = res[1];
			}

			if(typeof pVdef[0][pname] != 'undefined'){
				pram = pVdef[0][pname]
				var deps = []
				val = rval
				if(pram["@type"]){
					var f =	pram["@type"]
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else{
							//	//////console.log(d)
								//////////console.log(['1208',self.props.sysSettings])
								return self.props.prodSettings[d];
							}
						});
						if(f == 'mm'){
							if(deps[0] == 0){
								dec = 1
							}
						}
					}	
					if(pram['@bit_len']<=16){
					//	//////console.log(f)

						val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));

					}
					
				}
				
				if(pram["@labels"]){
					label = true
				}
			}else if(typeof pVdef[1][pname] != 'undefined'){
				
				pram = pVdef[1][pname]
				
				var deps = []
				val = rval
				if(pram["@type"]){
					var f =	pram["@type"]
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(dp){
							var d = dp;
							if(dp.indexOf('[0]') != -1){
								if(pram['@name'].slice(-2) == '_A'){
									d = dp.replace('[0]','[1]')
								}
							}
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else{
								return self.props.prodSettings[d];
							}
						});
						if(pram['@name'] == 'BeltSpeed'){
							deps.push(self.props.dynSettings['EncFreq'])
						}
					}
					if(f == 'mm'){
							if(deps[0] == 0){
								dec = 1
							}
						}
					if(pram['@bit_len']<=16){
						////console.log(f)
						val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
					}
					
				}else if(pram["@name"].indexOf('DetThresh') != -1){
					var dependancies = ['DetMode','PhaseMode','ThresR','ThresX']
					var deps = dependancies.map(function(d) {
						// body...
						if(pram['@name'] == 'DetThresh_A'){
							return self.props.prodSettings[d+'_A']
						}else if(pram['@name'] == 'DetThresh_B'){
							return self.props.prodSettings[d+'_B']
						}
					})
					val = eval(funcJSON['@func']['det_thresh']).apply(this, [].concat.apply([],[val,deps]));
					
				}
				if(pram["@labels"]){
					label = true
				}
			}else if(typeof pVdef[2][pname] != 'undefined'){
				
				pram = pVdef[2][pname]
				
				var deps = []
				val = rval
				if(pram["@type"]){
					var f =	pram["@type"]
					if(f == 'phase'){
						val = 	(uintToInt(val,16)/100).toFixed(2)//?? phase is coming in with different format for dyn data
					}else{
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(dp){
							var d = dp;
							if(dp.indexOf('[0]') != -1){
								if(pram['@name'].slice(-2) == '_A'){
									d = dp.replace('[0]','[1]')
								}
							}	
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else if(pVdef[5][d]["@rec"] == 1){
								return self.props.prodSettings[d];
							}else if(pVdef[5][d]["@rec"] == 2){
							//		//////console.log(['1521',pVdef[5][d], self.props.dynSettings[d]])
								return self.props.dynSettings[d];
							}
						});
					}
					if(f == 'mm'){
							if(deps[0] == 0){
								dec = 1
						}
					}
					if(pram['@bit_len']<=16){
					//	//////console.log(f)
						
						val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
					}
				}
					
				}else if(pram['@name'] == 'RejExitDistEst'){
					var dependancies = ['SysRec.MetricUnits']
					deps = dependancies.map(function(d){
						if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else if(pVdef[5][d]["@rec"] == 1){
								return self.props.prodSettings[d];
							}else if(pVdef[5][d]["@rec"] == 2){
							//		//////console.log(['1521',pVdef[5][d], self.props.dynSettings[d]])
								return self.props.dynSettings[d];
							}
					})
					dec = 1
					val = eval(funcJSON['@func']['mm']).apply(this, [].concat.apply([], [val, deps]));

				}
				if(pram["@labels"]){
					label = true
				}
			}else if(typeof pVdef[3][pname] != 'undefined'){
				
				pram = pVdef[3][pname]
				
				var deps = []
				val = rval
				if(pram["@type"]){
					var f =	pram["@type"]
					if(f == 'phase'){
						val = 	(uintToInt(val,16)/100).toFixed(2)//?? phase is coming in with different format for dyn data
					}else{
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else if(pVdef[5][d]["@rec"] == 1){
								return self.props.prodSettings[d];
							}else if(pVdef[5][d]["@rec"] == 2){
							//		//////console.log(['1521',pVdef[5][d], self.props.dynSettings[d]])
								return self.props.dynSettings[d];
							}else if(pVdef[5][d]["@rec"] == 3){
							//		//////console.log(['1521',pVdef[5][d], self.props.dynSettings[d]])
								return self.props.framSettings[d];
							}
						});
					}
					if(pram['@bit_len']<=16){
					//	//////console.log(f)
						
						val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
					}
				}
					
				}
				if(pram["@labels"]){
					label = true
				}
			}else{
				val = rval
			}
			return val;
	}
	onFocus () {
		// body...
		this.props.onFocus();
	}
	onRequestClose () {
		// body...
		this.props.onRequestClose();
	}
	render(){
		var ft = [16,20,24];
		var wd = [150,260,297]
		var vwd = [75,125,169]
		var st = {display:'inline-block', fontSize:ft[this.state.font], width:wd[this.state.font]}
		var vst = {display:'inline-block', fontSize:ft[this.state.font], width:vwd[this.state.font]}
		var self = this;
		var fSize = 24;
		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
		var sty = {height:60}
				if(this.props.mobile){
					sty.height = 45;
					sty.lineHeight = '45px';
					//stye.paddingRight = 5
				}
				var res = vdefByMac[this.props.mac];
			var pVdef = _pVdef;
			if(res){
				pVdef = res[1];
			}
			////console.log('2885',pVdef,_pVdef)
			var label = false;
		if(this.props.hasChild){
			var namestring = this.props.name;
			var path = ""
			if(this.props.path.length == 0){
				path = namestring
			}else{
				path = this.props.path + '/'+ namestring
			}
			
			if(typeof catMapV2[path] != 'undefined'){
				//////////console.log('1270')
				namestring = catMapV2[path]['@translations'][this.props.language]
				//////////console.log('1272')

			}
			if(namestring.length > 28){
				fSize = 18
			}
			else if(namestring.length > 24){
				fSize= 20
			}else if(namestring.length > 18){
				fSize = 22
			}
			//	//////console.log(namestring)		
			//
				var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}
				if(this.props.mobile){
					_st.lineHeight = '51px'
					_st.height = 45
				}
				
		
		//	return <div className='sItem noChild' onClick={this.onItemClick}><label style={{display: 'table-cell',fontSize: fSize,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{namestring}</label>
		//	<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>More...<img style={{position:'absolute', width:48}}/></label></div></div>
		//	</div>		
		return (<div className='sItem hasChild' style={sty} onClick={this.onItemClick}><label>{namestring}</label></div>)
		}else{
			var val, pram;
			//if(this.props.isArray)
			//(Array.isArray)
			var namestring = this.props.name;

		if(typeof this.props.data == 'object'){

			if(typeof this.props.data['@data'] == 'undefined'){
			var path = ""
			if(this.props.path.length == 0){
				path = namestring
			}else{
				path = this.props.path + '/'+ namestring
			}
			
			if(typeof catMapV2[path] != 'undefined'){
				namestring = catMapV2[path]['@translations'][this.props.language]
			}
			if(namestring.length > 28){
				fSize = 18
			}
			else if(namestring.length > 24){
				fSize= 20
			}else if(namestring.length > 18){
				fSize = 22
			}
			var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}
			if(this.props.mobile){
				_st.lineHeight = '51px'
				_st.height = 45
			}
			////console.log(2692,this.props.data);
			
			if(typeof this.props.data[0]['child'] != 'undefined'){
				var lkey = this.props.data[0].params[this.props.data[0].child]['@name']
				val  = [this.getValue(this.props.data[0].params[this.props.data[0].child]['@data'], lkey)]
				if(typeof pVdef[0][lkey] != 'undefined'){
					pram = [pVdef[0][lkey]]
				}else if(typeof pVdef[1][lkey] != 'undefined'){
					pram = [pVdef[1][lkey]]
				}else if(typeof pVdef[2][lkey] != 'undefined'){
					pram = [pVdef[2][lkey]]
				}else if(typeof pVdef[3][lkey] != 'undefined'){
					pram = [pVdef[3][lkey]]
				}else if(lkey == 'Nif_ip'){
					pram = [{'@name':'Nif_ip', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(lkey == 'Nif_nm'){
					pram = [{'@name':'Nif_nm', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(lkey == 'Nif_gw'){
					pram = [{'@name':'Nif_gw', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(lkey == 'DCRate_A'){
					pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
				}
				if(this.props.data[0].params[this.props.data[0].child]['@children']){

					for(var i=0;i<this.props.children[0].length; i++){
						val.push(this.getValue(this.props.children[1][i], this.props.children[0][i]))
				
					
						if(typeof pVdef[0][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[0][this.props.children[0][i]])
						}else if(typeof pVdef[1][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[1][this.props.children[0][i]])
						}else if(typeof pVdef[2][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[2][this.props.children[0][i]])
						}else if(typeof pVdef[3][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[3][this.props.children[0][i]])
						}
					}
				}

			//	//////console.log(['2409',pram])	<img style={{position:'absolute', width:75,top:0, left:800}} src='assets/angle-right.svg'/>
				
				if(pram[0]['@labels']){
					label = true
				}	
				var im = <img  style={{position:'absolute', width:36,top:15, left:815, strokeWidth:'2%', transform:'scaleX(-1)' }} src='assets/return.svg'/>
				if(this.props.mobile){
					im = <img  style={{position:'absolute', width:'7%',height:'40%',top:'30%', left:'92%', strokeWidth:'2%', transform:'scaleX(-1)' }} src='assets/return.svg'/>
				}
				if(this.props.backdoor){
					im = ''
				}
				var edctrl = <EditControl mobile={this.props.mobile} mac={this.props.mac}  ov={true} language={this.props.language} ip={this.props.ip} ioBits={this.props.ioBits} acc={this.props.acc} onFocus={this.onFocus} onRequestClose={this.onRequestClose} activate={this.activate} ref='ed' vst={vst} lvst={st} param={pram} size={this.state.font} sendPacket={this.sendPacket} data={val} label={label} int={false} name={lkey}/>
				if(this.props.mobile){
					sty.height = 51
					sty.paddingRight = 5;
				}
				return (<div className='sItem noChild' style={sty} onClick={this.onItemClick}> {edctrl}
						{im}
					
					</div>)
				}

		
				return (<div className='sItem hasChild' style={sty} onClick={this.onItemClick}><label>{namestring}</label></div>)
			}else{
				val = [this.getValue(this.props.data['@data'], this.props.lkey)]
				//////////console.log(['1250',this.props.lkey, typeof this.props.data['@data']])
				//////////console.log(['1251', pVdef, pram])
				if(typeof pVdef[0][this.props.lkey] != 'undefined'){
					pram = [pVdef[0][this.props.lkey]]
				}else if(typeof pVdef[1][this.props.lkey] != 'undefined'){
					pram = [pVdef[1][this.props.lkey]]
				}else if(typeof pVdef[2][this.props.lkey] != 'undefined'){
					pram = [pVdef[2][this.props.lkey]]
				}else if(typeof pVdef[3][this.props.lkey] != 'undefined'){
					pram = [pVdef[3][this.props.lkey]]
				}else if(this.props.lkey == 'Nif_ip'){
					pram = [{'@name':'Nif_ip', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(this.props.lkey == 'Nif_nm'){
					pram = [{'@name':'Nif_nm', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(this.props.lkey == 'Nif_gw'){
					pram = [{'@name':'Nif_gw', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(this.props.lkey == 'DCRate_A'){
					pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
				}else{
					//console.log(2629,this.props.lkey)
				}

				if(this.props.data['@children']){
		//			//////console.log(['1346', this.props.data, this.props.children])
					for(var i=0;i<this.props.children[0].length;i++){
						val.push(this.getValue(this.props.children[1][i], this.props.children[0][i]))
						if(typeof pVdef[0][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[0][this.props.children[0][i]])
						}else if(typeof pVdef[1][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[1][this.props.children[0][i]])
						}else if(typeof pVdef[2][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[2][this.props.children[0][i]])
						}else if(typeof pVdef[3][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[3][this.props.children[0][i]])
						}
					}
				}
				if(pram[0]['@labels']){
					label = true
				}	
			}
			}else{


				val = [this.getValue(this.props.data['@data'], this.props.lkey)]
				if(typeof pVdef[0][this.props.lkey] != 'undefined'){
					pram = [pVdef[0][this.props.lkey]]
				}else if(typeof pVdef[1][this.props.lkey] != 'undefined'){
					pram = [pVdef[1][this.props.lkey]]
				}else if(typeof pVdef[2][this.props.lkey] != 'undefined'){
					pram = [pVdef[2][this.props.lkey]]
				}else if(typeof pVdef[3][this.props.lkey] != 'undefined'){
					pram = [pVdef[3][this.props.lkey]]
				}else if(this.props.lkey == 'Nif_ip'){
					pram = [{'@name':'Nif_ip', '@type':'ipv4_address', '@bit_len':32,'@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(this.props.lkey == 'Nif_nm'){
					pram = [{'@name':'Nif_nm', '@type':'ipv4_address', '@bit_len':32,'@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(this.props.lkey == 'Nif_gw'){
					pram = [{'@name':'Nif_gw', '@type':'ipv4_address', '@bit_len':32,'@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(this.props.lkey == 'DCRate_A'){
					pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
				}
				if(this.props.data['@children']){
					//////////console.log(['1346', this.props.data.children])
					for(var ch in this.props.data['@children']){
						val.push(this.getValue(this.props.data['@children'][ch], ch))
						if(typeof pVdef[0][ch] != 'undefined'){
							pram.push(pVdef[0][ch])
						}else if(typeof pVdef[1][ch] != 'undefined'){
							pram.push(pVdef[1][ch])
						}else if(typeof pVdef[2][ch] != 'undefined'){
							pram.push(pVdef[2][ch])
						}else if(typeof pVdef[3][ch] != 'undefined'){
							pram.push(pVdef[3][ch])
						}
					}
				}
				if(pram[0]['@labels']){
					label = true
				}
			}
			if(this.props.mobile){
				sty.height = 51;
				sty.paddingRight = 5;
			}
				var edctrl = <EditControl mobile={this.props.mobile} mac={this.props.mac}  ov={false} language={this.props.language} ip={this.props.ip} ioBits={this.props.ioBits} acc={this.props.acc} onFocus={this.onFocus} onRequestClose={this.onRequestClose} activate={this.activate} ref='ed' vst={vst} lvst={st} param={pram} size={this.state.font} sendPacket={this.sendPacket} data={val} label={label} int={false} name={this.props.lkey}/>
				return (<div className='sItem noChild' style={sty}> {edctrl}
					</div>)
			
		}
	}
}


class SettingItem3 extends React.Component{
	constructor(props) {
		super(props)

		this.sendPacket = this.sendPacket.bind(this);
		this.onItemClick = this.onItemClick.bind(this);
		this.activate = this.activate.bind(this);
		this.deactivate = this.deactivate.bind(this);
		this.getValue = this.getValue.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose =this.onRequestClose.bind(this);
		this.parseValues = this.parseValues.bind(this);
		var values = this.parseValues(this.props);
		this.state = ({mode:0,font:this.props.font, val:values[0], pram:values[1], labels:values[2]})
		

	}
	parseValues(props){
		var res = vdefByMac[props.mac];
			var pVdef = _pVdef;
			if(res){
				pVdef = res[1];
			}
		var val = [], pram = [], label = false;
		if(!props.hasChild){
			
		if(typeof props.data == 'object'){

			if(typeof props.data['@data'] == 'undefined'){
			
			if(typeof props.data[0]['child'] != 'undefined'){
				var lkey = props.data[0].params[props.data[0].child]['@name']
				val  = [this.getValue(props.data[0].params[props.data[0].child]['@data'], lkey)]
				if(typeof pVdef[0][lkey] != 'undefined'){
					pram = [pVdef[0][lkey]]
				}else if(typeof pVdef[1][lkey] != 'undefined'){
					pram = [pVdef[1][lkey]]
				}else if(typeof pVdef[2][lkey] != 'undefined'){
					pram = [pVdef[2][lkey]]
				}else if(typeof pVdef[3][lkey] != 'undefined'){
					pram = [pVdef[3][lkey]]
				}else if(lkey == 'Nif_ip'){
					pram = [{'@name':'Nif_ip', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(lkey == 'Nif_nm'){
					pram = [{'@name':'Nif_nm', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(lkey == 'Nif_gw'){
					pram = [{'@name':'Nif_gw', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(lkey == 'DCRate_A'){
					pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
				}
				if(props.data[0].params[props.data[0].child]['@children']){

					for(var i=0;i<props.children[0].length; i++){
						val.push(this.getValue(props.children[1][i], props.children[0][i]))
				
					
						if(typeof pVdef[0][props.children[0][i]] != 'undefined'){
							pram.push(pVdef[0][props.children[0][i]])
						}else if(typeof pVdef[1][props.children[0][i]] != 'undefined'){
							pram.push(pVdef[1][props.children[0][i]])
						}else if(typeof pVdef[2][props.children[0][i]] != 'undefined'){
							pram.push(pVdef[2][props.children[0][i]])
						}else if(typeof pVdef[3][props.children[0][i]] != 'undefined'){
							pram.push(pVdef[3][props.children[0][i]])
						}
					}
				}
				if(pram[0]['@labels']){
					label = true
				}	
				
				}

			}else{
				val = [this.getValue(props.data['@data'], props.lkey)]
				//////////console.log(['1250',props.lkey, typeof props.data['@data']])
				//////////console.log(['1251', pVdef, pram])
				if(typeof pVdef[0][props.lkey] != 'undefined'){
					pram = [pVdef[0][props.lkey]]
				}else if(typeof pVdef[1][props.lkey] != 'undefined'){
					pram = [pVdef[1][props.lkey]]
				}else if(typeof pVdef[2][props.lkey] != 'undefined'){
					pram = [pVdef[2][props.lkey]]
				}else if(typeof pVdef[3][props.lkey] != 'undefined'){
					pram = [pVdef[3][props.lkey]]
				}else if(props.lkey == 'Nif_ip'){
					pram = [{'@name':'Nif_ip', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(props.lkey == 'Nif_nm'){
					pram = [{'@name':'Nif_nm', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(props.lkey == 'Nif_gw'){
					pram = [{'@name':'Nif_gw', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(props.lkey == 'DCRate_A'){
					pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
				}else{
					//console.log(2629,props.lkey)
				}

				if(props.data['@children']){
		//			//////console.log(['1346', props.data, props.children])
					for(var i=0;i<props.children[0].length;i++){
						val.push(this.getValue(props.children[1][i], props.children[0][i]))
						if(typeof pVdef[0][props.children[0][i]] != 'undefined'){
							pram.push(pVdef[0][props.children[0][i]])
						}else if(typeof pVdef[1][props.children[0][i]] != 'undefined'){
							pram.push(pVdef[1][props.children[0][i]])
						}else if(typeof pVdef[2][props.children[0][i]] != 'undefined'){
							pram.push(pVdef[2][props.children[0][i]])
						}else if(typeof pVdef[3][props.children[0][i]] != 'undefined'){
							pram.push(pVdef[3][props.children[0][i]])
						}
					}
				}
				if(pram[0]['@labels']){
					label = true
				}	
			}
			}else{


				val = [this.getValue(props.data['@data'], props.lkey)]
				if(typeof pVdef[0][props.lkey] != 'undefined'){
					pram = [pVdef[0][props.lkey]]
				}else if(typeof pVdef[1][props.lkey] != 'undefined'){
					pram = [pVdef[1][props.lkey]]
				}else if(typeof pVdef[2][props.lkey] != 'undefined'){
					pram = [pVdef[2][props.lkey]]
				}else if(typeof pVdef[3][props.lkey] != 'undefined'){
					pram = [pVdef[3][props.lkey]]
				}else if(props.lkey == 'Nif_ip'){
					pram = [{'@name':'Nif_ip', '@type':'ipv4_address', '@bit_len':32,'@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(props.lkey == 'Nif_nm'){
					pram = [{'@name':'Nif_nm', '@type':'ipv4_address', '@bit_len':32,'@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(props.lkey == 'Nif_gw'){
					pram = [{'@name':'Nif_gw', '@type':'ipv4_address', '@bit_len':32,'@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(props.lkey == 'DCRate_A'){
					pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
				}
				if(props.data['@children']){
					//////////console.log(['1346', props.data.children])
					for(var ch in props.data['@children']){
						val.push(this.getValue(props.data['@children'][ch], ch))
						if(typeof pVdef[0][ch] != 'undefined'){
							pram.push(pVdef[0][ch])
						}else if(typeof pVdef[1][ch] != 'undefined'){
							pram.push(pVdef[1][ch])
						}else if(typeof pVdef[2][ch] != 'undefined'){
							pram.push(pVdef[2][ch])
						}else if(typeof pVdef[3][ch] != 'undefined'){
							pram.push(pVdef[3][ch])
						}
					}
				}
				if(pram[0]['@labels']){
					label = true
				}
			}	
		}
		return [val,pram,label]
	}
	sendPacket(n,v) {
		//
		var val = v
		if(n['@name'] == 'Nif_ip'){
			//console.log(v.toString())
			socket.emit('nifip', v.toString())
		}else if(n['@name'] == 'Nif_nm'){
			//console.log(v.toString())
			socket.emit('nifnm', v.toString())
		}else if(n['@name'] == 'Nif_gw'){
			//console.log(v.toString())
			socket.emit('nifgw', v.toString())
		}else{

		//}
		 if(n['@type'] == 'ipv4_address'){
			val = v.split('.').map(function(ip){
				return ("000"+ip).slice(-3);
			}).join('.')
			setTimeout(function(){
				socket.emit('locateReq');
			},200)
		}
		this.props.sendPacket(n,val)	
		}
	}
	componentWillReceiveProps (newProps) {
		// body...
		var values = this.parseValues(newProps);
		
		this.setState({font:newProps.font, val:values[0], pram:values[1], labels:values[2]})
	}
	onItemClick(){

		if(this.props.hasChild || typeof this.props.data == 'object'){
			//////console.log([this.props.data])
			// accessControl
			if(this.props.acc){
				this.props.onItemClick(this.props.data, this.props.name)	
			}else{

				toast('Access Denied')	
				}		
			}
	}
	activate () {
		this.props.activate(this.props.data)
	}
	deactivate () {
		// body...
		if(this.refs.ed){
			this.refs.ed.deactivate()
		}		
	}
	getValue(rval, pname){
		var pram;
			var val;
			var label = false
			var res = vdefByMac[this.props.mac];
			var pVdef = _pVdef;
			var dec = 0;
			var self = this;
			if(res){
				pVdef = res[1];
			}

			if(typeof pVdef[0][pname] != 'undefined'){
				pram = pVdef[0][pname]
				var deps = []
				val = rval
				if(pram["@type"]){
					var f =	pram["@type"]
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else{
							//	//////console.log(d)
								//////////console.log(['1208',self.props.sysSettings])
								return self.props.prodSettings[d];
							}
						});
						if(f == 'mm'){
							if(deps[0] == 0){
								dec = 1
							}
						}
					}	
					if(pram['@bit_len']<=16){
					//	//////console.log(f)

						val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));

					}
					
				}
				
				if(pram["@labels"]){
					label = true
				}
			}else if(typeof pVdef[1][pname] != 'undefined'){
				
				pram = pVdef[1][pname]
				
				var deps = []
				val = rval
				if(pram["@type"]){
					var f =	pram["@type"]
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(dp){
							var d = dp;
							if(dp.indexOf('[0]') != -1){
								if(pram['@name'].slice(-2) == '_A'){
									d = dp.replace('[0]','[1]')
								}
							}
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else{
								return self.props.prodSettings[d];
							}
						});
						if(pram['@name'] == 'BeltSpeed'){
							deps.push(self.props.dynSettings['EncFreq'])
						}
					}
					if(f == 'mm'){
							if(deps[0] == 0){
								dec = 1
							}
						}
					if(pram['@bit_len']<=16){
						////console.log(f)
						val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
					}
					
				}else if(pram["@name"].indexOf('DetThresh') != -1){
					var dependancies = ['DetMode','PhaseMode','ThresR','ThresX']
					var deps = dependancies.map(function(d) {
						// body...
						if(pram['@name'] == 'DetThresh_A'){
							return self.props.prodSettings[d+'_A']
						}else if(pram['@name'] == 'DetThresh_B'){
							return self.props.prodSettings[d+'_B']
						}
					})
					val = eval(funcJSON['@func']['det_thresh']).apply(this, [].concat.apply([],[val,deps]));
					
				}
				if(pram["@labels"]){
					label = true
				}
			}else if(typeof pVdef[2][pname] != 'undefined'){
				
				pram = pVdef[2][pname]
				
				var deps = []
				val = rval
				if(pram["@type"]){
					var f =	pram["@type"]
					if(f == 'phase'){
						val = 	(uintToInt(val,16)/100).toFixed(2)//?? phase is coming in with different format for dyn data
					}else{
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(dp){
							var d = dp;
							if(dp.indexOf('[0]') != -1){
								if(pram['@name'].slice(-2) == '_A'){
									d = dp.replace('[0]','[1]')
								}
							}	
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else if(pVdef[5][d]["@rec"] == 1){
								return self.props.prodSettings[d];
							}else if(pVdef[5][d]["@rec"] == 2){
							//		//////console.log(['1521',pVdef[5][d], self.props.dynSettings[d]])
								return self.props.dynSettings[d];
							}
						});
					}
					if(f == 'mm'){
							if(deps[0] == 0){
								dec = 1
						}
					}
					if(pram['@bit_len']<=16){
					//	//////console.log(f)
						
						val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
					}
				}
					
				}else if(pram['@name'] == 'RejExitDistEst'){
					var dependancies = ['SysRec.MetricUnits']
					deps = dependancies.map(function(d){
						if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else if(pVdef[5][d]["@rec"] == 1){
								return self.props.prodSettings[d];
							}else if(pVdef[5][d]["@rec"] == 2){
							//		//////console.log(['1521',pVdef[5][d], self.props.dynSettings[d]])
								return self.props.dynSettings[d];
							}
					})
					dec = 1
					val = eval(funcJSON['@func']['mm']).apply(this, [].concat.apply([], [val, deps]));

				}
				if(pram["@labels"]){
					label = true
				}
			}else if(typeof pVdef[3][pname] != 'undefined'){
				
				pram = pVdef[3][pname]
				
				var deps = []
				val = rval
				if(pram["@type"]){
					var f =	pram["@type"]
					if(f == 'phase'){
						val = 	(uintToInt(val,16)/100).toFixed(2)//?? phase is coming in with different format for dyn data
					}else{
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else if(pVdef[5][d]["@rec"] == 1){
								return self.props.prodSettings[d];
							}else if(pVdef[5][d]["@rec"] == 2){
							//		//////console.log(['1521',pVdef[5][d], self.props.dynSettings[d]])
								return self.props.dynSettings[d];
							}else if(pVdef[5][d]["@rec"] == 3){
							//		//////console.log(['1521',pVdef[5][d], self.props.dynSettings[d]])
								return self.props.framSettings[d];
							}
						});
					}
					if(pram['@bit_len']<=16){
					//	//////console.log(f)
						
						val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
					}
				}
					
				}
				if(pram["@labels"]){
					label = true
				}
			}else{
				val = rval
			}
			return val;
	}
	onFocus () {
		// body...
		this.props.onFocus();
	}
	onRequestClose () {
		// body...
		this.props.onRequestClose();
	}
	render(){
		var ft = [16,20,24];
		var wd = [150,260,297]
		var vwd = [75,125,169]
		var st = {display:'inline-block', fontSize:ft[this.state.font], width:wd[this.state.font]}
		var vst = {display:'inline-block', fontSize:ft[this.state.font], width:vwd[this.state.font]}
		var self = this;
		var fSize = 24;
		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
		var sty = {height:60}
			if(this.props.mobile){
				sty.height = 45;
				sty.lineHeight = '45px';
			}
			var res = vdefByMac[this.props.mac];
			var pVdef = _pVdef;
			if(res){
				pVdef = res[1];
			}
			////console.log('2885',pVdef,_pVdef)
			var label = false;
		if(this.props.hasChild){
			var namestring = this.props.name;
			var path = ""
			if(this.props.path.length == 0){
				path = namestring
			}else{
				path = this.props.path + '/'+ namestring
			}
			
			if(typeof catMapV2[path] != 'undefined'){
				//////////console.log('1270')
				namestring = catMapV2[path]['@translations'][this.props.language]
				//////////console.log('1272')

			}
			if(namestring.length > 28){
				fSize = 18
			}
			else if(namestring.length > 24){
				fSize= 20
			}else if(namestring.length > 18){
				fSize = 22
			}
			//	//////console.log(namestring)		
			//
				var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}
				if(this.props.mobile){
					_st.lineHeight = '51px'
					_st.height = 45
				}
				
			return (<div className='sItem hasChild' style={sty} onClick={this.onItemClick}><label>{namestring}</label></div>)
		}else{
			var val, pram;
			//if(this.props.isArray)
			//(Array.isArray)
			var namestring = this.props.name;

		if(typeof this.props.data == 'object'){

			if(typeof this.props.data['@data'] == 'undefined'){
			var path = ""
			if(this.props.path.length == 0){
				path = namestring
			}else{
				path = this.props.path + '/'+ namestring
			}
			
			if(typeof catMapV2[path] != 'undefined'){
				namestring = catMapV2[path]['@translations'][this.props.language]
			}
			if(namestring.length > 28){
				fSize = 18
			}
			else if(namestring.length > 24){
				fSize= 20
			}else if(namestring.length > 18){
				fSize = 22
			}
			var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}
			if(this.props.mobile){
				_st.lineHeight = '51px'
				_st.height = 45
			}
			////console.log(2692,this.props.data);
			
			if(typeof this.props.data[0]['child'] != 'undefined'){
				var lkey = this.props.data[0].params[this.props.data[0].child]['@name']
			
				var im = <img  style={{position:'absolute', width:36,top:15, left:815, strokeWidth:'2%', transform:'scaleX(-1)' }} src='assets/return.svg'/>
				
				if(this.props.mobile){
					im = <img  style={{position:'absolute', width:'7%',height:'40%',top:'30%', left:'92%', strokeWidth:'2%', transform:'scaleX(-1)' }} src='assets/return.svg'/>
				}
		
				if(this.props.backdoor){
					im = ''
				}
				var edctrl = <EditControl mobile={this.props.mobile} mac={this.props.mac}  ov={true} language={this.props.language} ip={this.props.ip} ioBits={this.props.ioBits} acc={this.props.acc} onFocus={this.onFocus} onRequestClose={this.onRequestClose} activate={this.activate} ref='ed' vst={vst} lvst={st} param={this.state.pram} size={this.state.font} sendPacket={this.sendPacket} data={this.state.val} label={this.state.label} int={false} name={lkey}/>
				if(this.props.mobile){
					sty.height = 51
					sty.paddingRight = 5
				}
				return (<div className='sItem noChild' style={sty} onClick={this.onItemClick}> {edctrl}
						{im}
					
					</div>)
				}

		
				return (<div className='sItem hasChild' style={sty} onClick={this.onItemClick}><label>{namestring}</label></div>)
			}
			}
			if(this.props.mobile){
				sty.height = 51;
				sty.paddingRight = 5;
			}
				var edctrl = <EditControl mobile={this.props.mobile} mac={this.props.mac}  ov={false} language={this.props.language} ip={this.props.ip} ioBits={this.props.ioBits} acc={this.props.acc} onFocus={this.onFocus} onRequestClose={this.onRequestClose} activate={this.activate} ref='ed' vst={vst} lvst={st} param={this.state.pram} size={this.state.font} sendPacket={this.sendPacket} data={this.state.val} label={this.state.label} int={false} name={this.props.lkey}/>
				return (<div className='sItem noChild' style={sty}> {edctrl}
					</div>)
			
		}
	}
}



class MultiEditControl extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({val:this.props.data.slice(0), changed:false, mode:0, size:this.props.size})
		this.switchMode = this.switchMode.bind(this)
		this.deactivate = this.deactivate.bind(this)
		this.selectChanged = this.selectChanged.bind(this);
		this.valChanged = this.valChanged.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.onClick = this.onClear.bind(this);
		this.openSelector = this.openSelector.bind(this);
		this.valClick = this.valClick.bind(this);
	}
	componentWillReceiveProps(newProps){
		this.setState({val:newProps.data.slice(0)})
	}
	switchMode () {
		// body...
		if(this.props.acc){
			if(this.props.param[0]['@rpcs']){
				if((this.props.param[0]['@rpcs']['write'])||(this.props.param[0]['@rpcs']['toggle'])||(this.props.param[0]['@rpcs']['clear'])){
					var m = Math.abs(this.state.mode - 1)
					this.props.activate()
					this.setState({mode:m})
				}
			}
		}	
	}
	deactivate () {
		this.setState({mode:0})
	}
	selectChanged(v,i){
		var val = v//e.target.value//e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
		this.props.sendPacket(this.props.param[i], parseInt(val));
		var value = this.state.val;
		value[i] = v// e.target.value
	}
	valChanged(v,i){
		//console.log(['2734',v,i,this.props.param[i]])
		var val;
		if(!isNaN(v)){
			val = parseFloat(v)
		}else{ 
			val = v;
		}
		//console.log('2735', val)
		if(this.props.param[i]['@type'] == 'mm'){
			if(v.indexOf('in') != -1){
				val = val*10;
			}
		}else if(this.props.param[i]['@name'].indexOf('PhaseAngleAuto') != -1){
			val = val*Math.pow(10,this.props.param[i]['@decimal'])
		}else if(this.props.param[i]['@type'] == 'rej_del'){

			if(v.indexOf('.') != -1){
				val = val*Math.pow(10,this.props.param[i]['@decimal'])
			}
			//console.log('3149',v,val)
		}else if(this.props.param[i]['@type'] == 'belt_speed'){
			if(v.indexOf('.') != -1){
				val = val*10
			}
		}
		
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
		var value = this.state.val;	
		value[i] = val;
		this.setState({val:value})
		if(this.props.param[i]['@bit_len'] > 16){
			//val = v + "                    "

			this.props.sendPacket(this.props.param[i], v)
		}else if(!Number.isNaN(val)){
			//console.log('why')
			this.props.sendPacket(this.props.param[i], parseInt(val));
		}
	}
	onFocus () {
		this.props.onFocus();
	}
	onRequestClose () {
		this.props.onRequestClose();
	}
	onClear (id) {
		//console.log(3040,id)
		this.props.sendPacket(this.props.param[id])
	}
	openSelector () {
		if(!this.props.ov){
	
			var self = this;
			if(this.refs.pw){
				setTimeout(function () {
					self.refs.pw.toggleCont();
				},100)
				
			}
		}
		
	}
	valClick (ind) {
		if(!this.props.ov){
			if(this.props.param[ind]['@rpcs']){
				if(this.props.param[ind]['@rpcs']['clear']){
					this.onClear(ind)
				}else if(this.props.param[ind]['@rpcs']['start']){
					this.onClear(ind)
				}else if(this.refs['input' + ind]){
					this.refs['input' + ind].toggle();
				}
			}else if(this.refs['input' + ind]){
					this.refs['input' + ind].toggle();
			}
		}
	}
	render() {
		////console.log(3243, this.props.mobile)
		var namestring = this.props.name
		////////console.log(['2692',namestring])
			if(typeof vdefByMac[this.props.mac][5][this.props.name] != 'undefined'){
				if(vdefByMac[this.props.mac][5][this.props.name]['@translations'][this.props.language]['name'] != ''){
					namestring = vdefByMac[this.props.mac][5][this.props.name]['@translations'][this.props.language]['name']
				}
			}
		var dt = false;
		var self = this;
		var fSize = 24;
		if(namestring.length > 24){
			fSize = 18
		}
		else if(namestring.length > 20){
			fSize= 20
		}else if(namestring.length > 12){
			fSize = 22
		}
		if(this.props.mobile){
			fSize -= 7;
			fSize = Math.max(13, fSize)
		}
		let lvst = {display: 'table-cell',fontSize: fSize,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}

		var isInt = false
		var colors = ['#000','#eee']
		var regexA = /_A$/
		var regexB = /_B$/
		if(this.state.val.length == 2){
			if(this.props.param[0]['@name'].search(regexA) != -1){
				if(this.props.param[1]['@name'].search(regexB) != -1){
					if(this.props.param[0]['@name'].slice(0,-2) == this.props.param[1]['@name'].slice(0,-2)  ){
						isInt = true;
					}
				}
			}
		}
		var labWidth = (536/this.state.val.length)
		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
		if(this.props.mobile){
			labWidth = parseInt(100/this.state.val.length) + '%'
			vlabelswrapperStyle.width = '60%'
			lvst.verticalAlign = 'middle'
			lvst.lineHeight = '25px'
		}
			var vLabels = this.state.val.map(function(d,i){
			var val = d;
			var st = {textAlign:'center',lineHeight:'60px', height:60}

			st.width = labWidth
			st.fontSize = self.props.vst.fontSize;
			st.display = 'table-cell';//self.props.vst.display;
			if(self.props.mobile){
				st.height = 51
				st.lineHeight = '51px'
				st.display = 'inline-block'
				//labWidth = (50/this.state.val.length)+'%'
			}
			if(isInt){ st.color = colors[i] }

			if(typeof self.props.param[i]['@labels'] != 'undefined'){
				var list =  _pVdef[6][self.props.param[i]["@labels"]];
				if(self.props.param[i]["@labels"] == 'DCRate'){
					var dclab = ['fastest','fast','med','slow'];
					list = {'english':dclab}
					val = dclab[d];
				}else{
					val = _pVdef[6][self.props.param[i]["@labels"]]['english'][d];
				
				}
				

				if((self.props.language != 'english')&&(typeof list[self.props.language] != 'undefined')&&(typeof list[self.props.language][d] == 'string') &&(list[self.props.language][d].trim().length != 0)){
					val = _pVdef[6][self.props.param[i]["@labels"]][self.props.language][d];
				}
				if((self.props.param[i]['@labels'] == 'InputSrc')){
					if(self.props.ioBits[self.props.param[i]['@name'].slice(6)] == 0){
						st.color = '#666'
					}
				}else if((self.props.param[i]['@labels'] == 'OutputSrc')){
					if(self.props.ioBits[outputSrcArr[d]] == 0){
						st.color = '#666'
					}
			}/*else if((self.props.param[i]['@labels'] == 'FaultMaskBit')){
					if(self.props.faultBits.indexOf(self.props.param[i]['@name'].slice(0,-4)) != -1){
						st.color= '#ffa500'
					}
				}*/
			}
			return (<CustomLabel index={i} onClick={self.valClick} style={st}>{val}</CustomLabel>)
		})

	
		if(isInt){
			vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480', background:'linear-gradient(75deg, rgb(129, 138, 144), rgb(129, 138, 144) 49.7%, rgb(72, 64, 116) 50.3%, rgb(72, 64, 116))'}
		
		}
		var acc = false
		if(this.props.acc){
			if(this.props.param[0]['@rpcs']){
				if((this.props.param[0]['@rpcs']['write'])||(this.props.param[0]['@rpcs']['toggle'])||(this.props.param[0]['@rpcs']['clear'])){
			acc = true
		}}}
		if(!acc){
			return(<div><label style={lvst}>{namestring + ': '}</label>
				<div style={vlabelswrapperStyle}><div style={vlabelStyle}>{vLabels}</div></div></div>)

		}else{
				var multiDropdown = true;
				this.props.param.forEach(function (p) {
					if((typeof p['@labels'] == 'undefined') &&(p['@name'].indexOf('TestConfigCount') == -1)){
						multiDropdown = false;
					}
				})
			
				var options;
				
				if(multiDropdown){
					var lists = this.props.param.map(function (p) {
						// body...
						if(p['@name'].indexOf('TestConfigCount') != -1){
							return [0,1,2,3,4,5,6,7,8,9]
						}else if(p['@name'].indexOf('DCRate') != -1){
							return ['fastest','fast','med','slow'];
						}else{
							var list = _pVdef[6][p["@labels"]]['english'].slice(0);
							if(self.props.language != 'english'){
								if(typeof _pVdef[6][p["@labels"]][self.props.language] != 'undefined'){
									list.forEach(function(lb,i){
										if((typeof _pVdef[6][p["@labels"]][self.props.language][i] == 'string') &&(_pVdef[6][p["@labels"]][self.props.language][i].trim().length != 0)){
											list[i] = _pVdef[6][p["@labels"]][self.props.language][i]
										}
									})
								}
							}
							return list//_pVdef[6][p["@labels"]]['english']
						}
					})
					options = <PopoutWheel mobile={this.props.mobile} params={this.props.param} ioBits={this.props.ioBits} vMap={this.props.vMap} language={this.props.language}  interceptor={isInt} name={namestring} ref='pw' val={this.state.val} options={lists} onChange={this.selectChanged}/>

					return(<div><div onClick={this.openSelector}><label style={lvst}>{namestring + ': '}</label><div style={vlabelswrapperStyle}><div style={vlabelStyle}>{vLabels}</div></div></div>
					<div style={{paddingLeft:this.props.lvst.width}}>
						{options}
					</div></div>)
				}else{
					options = this.state.val.map(function(v, i){
						if(typeof self.props.param[i]['@labels'] != 'undefined'){

							var labs;
							if(self.props.param[i]['@labels'] == 'DCRate'){
								labs = ['fastest','fast','med','slow'];
							}else{
								labs = _pVdef[6][self.props.param[i]["@labels"]]['english']
					
							}
							var opts = labs.map(function(e,i){
								if(i == v){
									return (<option selected value={i}>{e}</option>)

								}else{
									return (<option value={i}>{e}</option>)

								}
							})

							return <PopoutWheel mobile={this.props.mobile} params={this.props.param}  ioBits={this.props.ioBits} vMap={self.props.vMap} language={this.props.language} interceptor={isInt} name={namestring} ref={'input'+i} val={[v]} options={[_pVdef[6][self.props.param[i]["@labels"]]['english']]} onChange={self.selectChanged} index={i}/>
						}else{
							var num = true
							if(self.props.param[i]['@name'] == 'ProdName' || self.props.param[i]['@name'] == 'DspName'){
								num = false
							}
							 if(self.props.param[i]["@name"].indexOf('DateTime') != -1){
								dt = true;
							}
							var lbl = namestring
							if(isInt){
								lbl = lbl + [' A',' B'][i];
							}
							
							return <CustomKeyboard mobile={self.props.mobile}  datetime={dt} language={self.props.language} tooltip={self.props.vMap['@translations'][self.props.language]['description']} vMap={self.props.vMap}  onFocus={self.onFocus} ref={'input'+i} onRequestClose={self.onRequestClose} onChange={self.valChanged} index={i} value={v} num={num} label={lbl + ' - ' + v}/>
						}
					})

					return(<div><label style={lvst}>{namestring + ': '}</label>
						<div style={vlabelswrapperStyle}><div style={vlabelStyle}>{vLabels}</div></div>{options}</div>
						
					)
				}


		}
		
	}
}
class CustomAlertClassedButton extends React.Component{
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this);
		this.accept = this.accept.bind(this);
	}
	onClick () {
		var self = this;
		setTimeout(function(){
			self.refs.cfmodal.show();
		},100)	
	}
	accept (){
		this.props.onClick()
	}
	render () {
		var style = this.props.style || {}
		var klass = 'customAlertButton'
		if(this.props.className){
			klass = this.props.className
		}
		return	(<div style={style}><button className={klass} style={style} onClick={this.onClick} >{this.props.children}
		
		</button>
			<AlertModal ref='cfmodal' accept={this.accept}>
					<div style={{color:'#e1e1e1'}}>{this.props.alertMessage}</div>
				</AlertModal>
		</div>)
	}
}
class CustomAlertButton extends React.Component{
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this);
		this.accept = this.accept.bind(this);
	}
	onClick () {
		var self = this;
		setTimeout(function(){
			self.refs.cfmodal.show();
		},100)	
	}
	accept (){
		this.props.onClick()
	}
	render () {
		var style = this.props.style || {}
		var klass = 'customAlertButton'
		if(this.props.className){
			klass = this.props.className
		}
		return	(<div className={klass} style={style}><div onClick={this.onClick} >{this.props.children}
		
		</div>
			<AlertModal ref='cfmodal' accept={this.accept}>
					<div>{this.props.alertMessage}</div>
				</AlertModal>
		</div>)
	}
}
class AlertModal extends React.Component{
	constructor(props){
		super(props)
		var klass = 'custom-modal'
		if(this.props.className){
			klass = this.props.className
		}
		this.state = ({className:klass, show:false, override:false ,keyboardVisible:false});
		this.show = this.show.bind(this);
		this.close = this.close.bind(this);
		this.accept = this.accept.bind(this);
	}
	show () {
		this.setState({show:true})
	}
	close () {
		var self = this;
		setTimeout(function () {
			self.setState({show:false})
		},100)
		
	}
	accept(){
		this.props.accept();
	}
	render () {
		var	cont = ""
		if(this.state.show){
		cont =  <AlertModalCont vMap={this.props.vMap} accept={this.accept} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.onChange} close={this.close} value={this.props.value} options={this.props.options}>{this.props.children}</AlertModalCont>
		}
		return <div hidden={!this.state.show} className= 'pop-modal'>
	{/*	<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>*/}
			{cont}
		</div>
	}
}
class AlertModalC extends React.Component{
	constructor(props){
		super(props);
		this.handleClickOutside = this.handleClickOutside.bind(this)
		this.close = this.close.bind(this);
		this.accept = this.accept.bind(this);
		this.cancel = this.cancel.bind(this);
	}
	componentDidMount() {
		// body...
	}
	handleClickOutside(e) {
		// body...
		if(this.props.show){
			this.props.close();
		}
		
	}
	close() {
		// body...
		if(this.props.show){
			this.props.close();
		}
	}
	accept(){
		var self = this;
		this.props.accept();
		setTimeout(function(){
			if(self.props.show){
			self.props.close();
			}
		}, 100)
		
	}
	cancel(){
		var self = this;
		setTimeout(function(){
			self.close();
			
		}, 100)
	}
	render () {
		// body...
		var self = this;
		
	  return( <div className='alertmodal-outer'>
	  			<div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:'#fefefe', fontSize:30}}>Confirm Action</div>
	  			{this.props.children}
				<div><button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={this.accept}>Confirm</button><button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={this.close}>Cancel</button></div>
	  		
		  </div>)

	}
}
var AlertModalCont =  onClickOutside(AlertModalC);
class CustomLabel extends React.Component{
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this);
	}
	onClick () {
		// body...
		if(this.props.onClick){
			this.props.onClick(this.props.index)
		}
		
	}
	render () {
		var style = this.props.style || {}
		return <label onClick={this.onClick} style={style}>{this.props.children}</label>
	}
}
class PopoutWheel extends React.Component{
	constructor(props) {
		super(props)
		this.onChange = this.onChange.bind(this);
		this.toggle = this.toggle.bind(this);
		this.toggleCont =this.toggleCont.bind(this);
		this.onCancel = this.onCancel.bind(this);
	}
	onCancel(){
		if(this.props.onCancel){
			this.props.onCancel();
		}
	}
	onChange (v,i,i2) {
		if(typeof this.props.index != 'undefined'){
			this.props.onChange(v,this.props.index)
		}else{
			this.props.onChange(v,i,i2)
		}
		
	}
	toggleCont () {
		this.refs.md.toggle();
	}
	toggle () {
		this.refs.md.toggle();
	}
	render () {
		var value = "placeholder"
		return	<PopoutWheelModal mobile={this.props.mobile} onCancel={this.onCancel} params={this.props.params} vMap={this.props.vMap} ioBits={this.props.ioBits} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} ref='md' onChange={this.onChange} value={this.props.val} options={this.props.options} ref='md'/>
	}
}
class PopoutWheelModal extends React.Component{
	constructor(props) {
		super(props)
		this.state = {show:false}
		this.toggle = this.toggle.bind(this);
		this.close = this.close.bind(this);
		this.onChange = this.onChange.bind(this);
	}
	toggle () {
		this.setState({show:true})
	}
	close (v) {
		var self = this;

		setTimeout(function () {
			self.setState({show:false})
		},80)
		if(v == 0){
			this.props.onCancel();
		}
		
	}
	onChange(v,i,i2){
		this.props.onChange(v,i,i2)
	}
	render () {
		var	cont = ""
		if(this.state.show){
		cont =  <PopoutWheelModalCont mobile={this.props.mobile} params={this.props.params}  vMap={this.props.vMap} ioBits={this.props.ioBits} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.onChange} close={this.close} value={this.props.value} options={this.props.options} />
		}
		return <div hidden={!this.state.show} className= 'pop-modal'>
	{/*	<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>*/}
			{cont}
		</div>
	}
}
class PopoutWheelModalC extends React.Component{
	constructor(props){
		super(props);
		this.state = {value:this.props.value.slice(0)}
		this.handleClickOutside = this.handleClickOutside.bind(this)
		this.close = this.close.bind(this);
		this.select = this.select.bind(this);
		this.accept = this.accept.bind(this);
		this.help = this.help.bind(this);
	}
	componentDidMount() {
		// body...
		this.setState({value:this.props.value.slice(0)})
	}
	handleClickOutside(e) {
		// body...
		if(this.props.show){
			this.props.close(0);
		}
		
	}
	close(v) {
		// body...
		if(this.props.show){
			//console.log(3709, v)
			this.props.close(v);
		}
	}
	select(v, i) {
		// body...
		var values = this.state.value
		values[i] = v;
		this.setState({value:values})
		//////console.log([2913,v])
	}
	accept() {
		var self = this;
		//////console.log(['accept',this.props.value[0], this.state.value[0]])
		if(this.props.value[0] != this.state.value[0]){
			//////console.log('wtf')
			this.props.onChange(this.state.value[0], 0)
			if(this.props.value.length > 1){
				if(this.props.value[1] != this.state.value[1]){
					setTimeout(function () {				// body...
						self.props.onChange(self.state.value[1],1);
						if(self.props.value.length > 2){
							if(self.props.value[2] != self.state.value[2]){
								setTimeout(function () {
									self.props.onChange(self.state.value[2],2)
									self.close(1);
								},80)
							}else{
								self.close(1);
							}
						}else{
							self.close(1);
						}
					},80)
				}else{
					if(this.props.value[2] != this.state.value[2]){
						setTimeout(function () {
							self.props.onChange(self.state.value[2],2)
							self.close(1);
						},80)
					}else{
						self.close(1);
					}
				}
			}else{
				this.close(1);
			}
		}else if(this.props.value.length > 1){
			if(this.props.value[1] != this.state.value[1]){
				this.props.onChange(this.state.value[1],1);
				if(this.props.value.length > 2){
					if(this.props.value[2] != this.state.value[2]){
						setTimeout(function () {
							self.props.onChange(self.state.value[2],2)
							self.close(1);
						},80)
					}else{
						self.close(1);
					}
				}else{
					self.close(1);
				}
			}else{
				if(this.props.value[2] != this.state.value[2]){
					this.props.onChange(this.state.value[2],2)
				}
			this.close(1);
				
			}
		}else{
			this.close(1);
		}


	}
	help () {
		// body...
		//console.log('help modal should open')
		this.refs.helpModal.toggle();
	}
	render () {
		// body...
		var self = this;
		var hs = this.props.options.map(function(op) {
			// body...
			return op.length*60
		})
		var height = hs.reduce(function(a,b){ return Math.max(a,b)});
		if(height > 315){
			height = 315;
		}
		if(this.props.mobile){
			height = 200
		}
		var wheels;
		var helpStyle = {float:'right', display:'inline-block', marginLeft:-50, marginRight:15, marginTop:6};
		if(this.state.value.length == 1){
			//helpStyle.position = 'absolute'
			wheels  = this.state.value.map(function (m,i) {
				var params = null;
				if(self.props.params){
					params = self.props.params[i]
				}
			// body...
			return <PopoutWheelSelector params={params}  height={height} ioBits={self.props.ioBits} interceptor={self.props.interceptor} Id={self.props.name+i} value={m} options={self.props.options[i]} index={i} onChange={self.select}/>
			})
		}else{
			wheels  = this.state.value.map(function (m,i) {
			// body...
		//	//////console.log(['2258',self.props.vMap,i])
		  	var lb = ''
		  	if(typeof self.props.vMap != 'undefined'){
		  		////console.log(3321, self.props.vMap)
		  		lb = 	vdefMapV2['@labels'][self.props.vMap['@labels'][i]][self.props.language]['name']
				
		  	}	
		  	var params = null;
				if(self.props.params){
					params = self.props.params[i]
					//console.log(params)
				}
			// body...
			return <PopoutWheelSelector params={params}  height={height} ioBits={self.props.ioBits} label={lb} interceptor={self.props.interceptor} Id={self.props.name+i} value={m} options={self.props.options[i]} index={i} onChange={self.select}/>
			})
		}
		
		var tooltiptext = 'This is a tooltip'
		////console.log(this.props.vMap)
		if(typeof this.props.vMap != 'undefined'){
			if(this.props.vMap['@translations'][self.props.language]['description'].length >0){
				tooltiptext = this.props.vMap['@translations']['english']['description'];
			}
		}
		var minW = 400
		if(this.props.mobile){
			minW = 300
		}
		////console.log(tooltiptext)
	  return( <div className='selectmodal-outer' style={{minWidth:minW}}>
	  		<div style={{display:'inline-block', marginRight:'auto', marginLeft:'auto', textAlign:'center', color:'#fefefe', fontSize:30}}>{this.props.name}</div>
	  		<div  style={helpStyle}><img src='assets/help.svg' onClick={this.help} width={30}/></div>
	  		<div style={{textAlign:'center', padding:5}}>
	  		{wheels}
	  		</div>
	  		<div><button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={this.accept}>{vdefMapV2['@labels']['Accept'][this.props.language].name}</button>
	  		<button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={()=> this.close(0)}>{vdefMapV2['@labels']['Cancel'][this.props.language].name}</button></div>
	  		<Modal ref='helpModal' Style={{color:'#e1e1e1',width:400}}>
	  		<div>{tooltiptext}</div>
	  		</Modal>
	  </div>)

	}
}
var PopoutWheelModalCont =  onClickOutside(PopoutWheelModalC);

class PopoutWheelSelector extends React.Component{
	constructor(props) {
		super(props)
		this.select = this.select.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.scrollUp = this.scrollUp.bind(this);
		this.scrollDown = this.scrollDown.bind(this);

	}
	select (i) {
		// body...
		this.props.onChange(i, this.props.index)
	}
	componentDidMount () {
		// body...
		//scrollToComponent(this.refs[this.props.options[this.props.value].toString()], { offset: 0, align: 'top', duration: 500})
		setScrollTop(this.props.Id,54*this.props.value)
	}
	handleScroll () {
		// body...
		 var el = document.getElementById(this.props.Id)		
     	 if(el){
			if(el.scrollTop > 5){
				this.refs.arrowTop.show();
			}else{
				this.refs.arrowTop.hide();
			}
			if(el.scrollTop + el.offsetHeight < el.scrollHeight ){
				this.refs.arrowBot.show();
			}else{
				this.refs.arrowBot.hide();
			}
    	}
		/*if(this.props.options.length > 7){
			if(document.getElementById(this.props.Id).scrollTop > 5){
				this.refs.arrowTop.show();
			}else{
				this.refs.arrowTop.hide();
			}
			if(document.getElementById(this.props.Id).scrollTop+325 < this.props.options.length*45 ){
				this.refs.arrowBot.show();
			}else{
				this.refs.arrowBot.hide();
			}
		}*/
	}
	scrollUp () {
		// body...
		_scrollById(this.props.Id,-225,200);
	}
	scrollDown () {
		// body...
		_scrollById(this.props.Id,225,200);
		//setScrollTop(this.props.Id, document.getElementById(this.props.Id).scrollTop + 200)
	}
	render () {
		// body...
		var self = this;
		var sa = this.props.options.length > 6
		var options = this.props.options.map(function (o,i) {
			var active = true;
			if(self.props.ioBits){
				if(self.props.params){
					if(self.props.params['@labels'] == 'InputSrc'){
						if(self.props.ioBits[inputSrcArr[i]] == 0){
							active = false;
						}
					}else if(self.props.params['@labels'] == 'OutputSrc'){
						if(self.props.ioBits[outputSrcArr[i]]==0){
							active = false;
						}
					}
				}
			}
			// body...
			if(i == self.props.value){

				return <SelectSCModalRow active={active} ref={o.toString()} onClick={self.select} value={o} index={i} selected={true}/>
			}else{
				return <SelectSCModalRow active={active} ref={o.toString()} onClick={self.select} value={o} index={i} selected={false}/>
			}
		})
		var ul;
		if(this.props.label){
			ul = <div style={{color:"#ccc", marginTop:-16, lineHeight:1.5,display:'block'}}>{this.props.label}</div>
			/*if(this.props.index == 0){
				ul = <label style={{color:"#ccc"}}>Channel A</label>
			}else{
				ul = <label style={{color:"#ccc"}}>Channel B</label>
			}*/
			
		}
		return(
			<div style={{display:'inline-block'}}>
			{ul}
			<ScrollArrow ref='arrowTop' active={sa} offset={48} width={48} marginTop={-25}  mode={'top'} onClick={this.scrollUp}/>
			<div id={this.props.Id} onScroll={this.handleScroll} style={{width:230, height:this.props.height, overflowY:'scroll', padding:5, marginLeft:5, marginRight:5, background:'rgba(200,200,200,1)'}}>
				{options}
			</div>
			<ScrollArrow ref='arrowBot' active={sa} offset={48} width={48} marginTop={-20} mode={'bot'} onClick={this.scrollDown}/>
		
			</div>)
		
	
	}
}
class PopoutSelect extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({val: this.props.val})
	}
	onChange(e){
		this.setState({val:parseInt(e)})
		this.props.onChange(parseInt(e), this.props.index, this.props.index2)
	}
	componentWillReceiveProps(newProps){
		this.setState({val:newProps.val})
	}
	toggleCont () {
		// body...
		var self = this;
		setTimeout(function () {
			// body...
			self.refs.md.toggle()
		},100)
		
	}
	render () {
		// body...
		var value = this.props.options[this.props.val]
		return(
			<div  className='customSelect' style={{width:180,   background: 'rgba(255,255,255,0.4)'	}}><div style={{padding:5}}  onClick={this.toggleCont}><div  className='popoutCustomSelect'>{value}</div><div style={{display:'inline-block'}}><img src='assets/dropdown.png' style={{width:30, height:30, marginBottom:-10}}/></div></div>
			<PopoutSelectModal onChange={this.onChange} value={this.props.val} options={this.props.options} ref='md'/>
			</div>
		)
	}
}
class PopoutSelectModal extends React.Component{
	constructor(props) {
		super(props)
		this.state = {show:false}
	}
	toggle () {
		// body...
		////////console.log(['1882',this.props.options[this.props.value]])
		
		this.setState({show:true})
	}
	close () {
		// body...
	//	//////console.log(['1882',this.props.options[this.props.value]])
		
		this.setState({show:false})
	}
	render () {
		// body...
		var	cont = ""
		if(this.state.show){
		cont =  <PopoutSelectModalCont show={this.state.show} onChange={this.props.onChange} close={this.close} value={this.props.value} options={this.props.options} />
		}
		return <div hidden={!this.state.show} className= 'pop-modal'>
	{/*	<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>*/}
			{cont}
		</div>
	}	
}
var PopoutSelectModalCont = onClickOutside(createReactClass({
	handleClickOutside:function (e) {
		// body...
		if(this.props.show){
			this.close();
		}
		
	},
	close:function () {
		// body...
		this.props.close();
	},
	select:function (i) {
		// body...
		this.props.onChange(i)
	},
	render:function () {
		// body...
		var self = this;
		var options = this.props.options.map(function (o,i) {
			// body...
			if(i == self.props.value){
				return <SelectModalRow onClick={self.select} value={o} index={i} selected={true}/>
			}else{
				return <SelectModalRow onClick={self.select} value={o} index={i} selected={false}/>
			}
		})
		return <div className='selectmodal-outer'>
			<div className='selectmodal-content' style={{textAlign:'center'}}>
			<table style={{marginLeft:'auto', marginRight:'auto', borderCollapse:'collapse',background:"#d1d1d1"}}><tbody>
				{options}
			</tbody></table>
			</div>
		</div>
	}
}))
class SelectModalRow extends React.Component{
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this);
	}
	onClick () {
		// body...
		if(!this.props.selected){
			this.props.onClick(this.props.index)
		}
		
	}
	render () {
		// body...
		var check= ""
		var style = {textAlign:'center'}
		if(this.props.selected){
			check = <img src="assets/Check_mark.svg"/>
			style ={textAlign:'center',background:'rgba(150,150,150,0.5)'}
		}
		return (<tr onClick={this.onClick} style={style}><td style={{width:22}}>{check}</td><td style={{width:130}}>{this.props.value}</td><td style={{width:22}}></td></tr>)
	}
}
class SelectSCModalRow extends React.Component{
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this);
	}
	onClick () {
		// body...
		if(!this.props.selected){
			this.props.onClick(this.props.index)
		}
		
	}
	render () {
		// body...
		var check= ""
		var style = {textAlign:'center'}
		if(this.props.selected){
			check = <img src="assets/Check_mark.svg"/>
			style ={textAlign:'center',background:'rgba(150,150,150,0.5)'}
			
		}
		if(!this.props.active){
				style.color = "#666"
			}
		return (<div onClick={this.onClick} style={style}><div style={{width:22, display:'table-cell'}}>{check}</div><div style={{width:180, display:'table-cell', lineHeight:'54px', height:54}}>{this.props.value}</div><div style={{width:22, display:'table-cell'}}></div></div>)
	}
}
class EditControl extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({val:this.props.data.slice(0), changed:false, mode:0, size:this.props.size})
		this.sendPacket = this.sendPacket.bind(this);
		this.valChanged = this.valChanged.bind(this);
		this.valChangedl = this.valChangedl.bind(this);
		this.valChangedb = this.valChangedb.bind(this);
		this.deactivate = this.deactivate.bind(this);
		this.valChangedlb = this.valChangedlb.bind(this);
		this.switchMode = this.switchMode.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
	}
	sendPacket(){
		var self = this;
		this.props.sendPacket(this.props.param[0], this.state.val[0])
		if(this.props.int){
			setTimeout(function () {
				// body...
				self.props.sendPacket(self.props.param[1], self.state.val[1])
			},100)
			
		}
		this.setState({mode:0})
	}
	valChanged(e){
		
		var val = e//e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
		var value = this.state.val;
		value[0] = e
		if(this.props.param[0]['@type'] =='ipv4_address'){
			this.props.sendPacket(this.props.param[0], val);
	
		}else{
			this.props.sendPacket(this.props.param[0], parseInt(val));
		
		}
		
		//////////console.log(this.props.data)
		this.setState({val:value})
	}
	valChangedl(e){
		
		var val = e.target.value//e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
			////////////console.log(val)
			this.props.sendPacket(this.props.param[0], parseInt(val));
		var value = this.state.val;
		value[0] = e.target.value
		//////////console.log(this.props.data)
		this.setState({val:value})
	}
	valChangedb(e){
		//////////console.log(e)
		var val = e;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
		var value = this.state.val;
		value[1] = e
		//////////console.log(this.props.data)
		this.setState({val:value})
	}
	valChangedlb(e){
	//	//////////console.log(e)
		var val = e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
			this.props.sendPacket(this.props.param[1], parseInt(val));
		var value = this.state.val;
		value[1] = e.target.value
		//////////console.log(this.props.data)
		this.setState({val:value})
	}
	componentWillReceiveProps (newProps) {
		this.setState({size:newProps.size, val:newProps.data.slice(0)})
	}
	deactivate () {
		// body...
		if(this.refs.ed){
			//////////console.log(['1511', 'this the prob'])
			this.refs.ed.setState({mode:0})
		}else{
			this.setState({mode:0})	
		}		
	}
	_handleKeyPress (e) {
		// body...
		if(e.key === 'Enter'){
			this.sendPacket();
		}
	}
	switchMode () {
		// body...
		if(this.props.acc){
			if(this.props.param[0]['@rpcs']){
				if((this.props.param[0]['@rpcs']['write'])||(this.props.param[0]['@rpcs']['toggle'])){
					var m = Math.abs(this.state.mode - 1)
					this.props.activate()
					this.setState({mode:m})
				}
			}
		}	
	}
	onSubmit(e){
		e.preventDefault();
		var valA = this.state.value[0];
		var valB = this.state.value[1];
		var self = this;
		if(this.props.bitLen == 16){
			valA = VdefHelper.swap16(valA)
			valB = VdefHelper.swap16(valB)

		}
		this.props.sendPacket(this.props.param[0], parseInt(valA));
		setTimeout(function(){
			self.props.sendPacket(self.props.param[1], parseInt(valB))
			
		}, 100)
		this.setState({editMode:false})
	}
	onFocus () {
		// body...
		this.props.onFocus();
	}
	onRequestClose () {
		this.props.onRequestClose()	
	}
	render(){
		var lab = (<label>{this.state.val}</label>)
		var num = true;
		var dt = false;
		var style = {display:'inline-block',fontSize:24}
		if((this.state.size == 1)||(this.props.mobile)){
			style = {display:'inline-block',fontSize:20}
		}else if(this.state.size == 0){
			style = {display:'inline-block',fontSize:16}
		}

		var namestring = this.props.name;
		if(namestring.indexOf('INPUT_')!= -1){
			//////////console.log(namestring)
			namestring = namestring.slice(6);
		}else if(namestring.indexOf('OUT_')!=-1){
			namestring = namestring.slice(4)
		}
		if(namestring.indexOf('PHY_')!= -1){
			namestring = namestring.slice(4)
		}
		if(this.props.param[0]["@name"].indexOf('ProdName')!=-1){
			num = false
		}
		else if(this.props.param[0]["@name"].indexOf('DateTime') != -1){
			dt = true;
		}
		//////////console.log(['1720',this.props.name, this.props.data])
		if(typeof vMapV2[this.props.name] != 'undefined'){
				if(vMapV2[this.props.name]['@translations'][this.props.language]['name'] != ''){
					namestring = vMapV2[this.props.name]['@translations'][this.props.language]['name']
				}
			}
		if(this.props.data.length > 0	){
			//if(Array.isArray(this.props.data[0])){
				//////////console.log('1728')
			//	return (<NestedEditControl mac={this.props.mac} language={this.props.language}  ip={this.props.ip} faultBits={this.props.faultBits} ioBits={this.props.ioBits} acc={this.props.acc} activate={this.props.activate} ref='ed' vst={this.props.vst} 
			//		lvst={this.props.lvst} param={this.props.param} size={this.props.size} sendPacket={this.props.sendPacket} data={this.props.data} label={this.props.label} int={this.props.int} name={this.props.name}/>)
		//	}else{
				//////////console.log('1732')
				return (<MultiEditControl mobile={this.props.mobile} mac={this.props.mac} ov={this.props.ov} vMap={vMapV2[this.props.name]} language={this.props.language} ip={this.props.ip} ioBits={this.props.ioBits}
				 onFocus={this.onFocus} onRequestClose={this.onRequestClose} acc={this.props.acc} activate={this.props.activate} ref='ed' vst={this.props.vst} 
					lvst={this.props.lvst} param={this.props.param} size={this.props.size} sendPacket={this.props.sendPacket} data={this.props.data} label={this.props.label} int={this.props.int} name={this.props.name}/>)
		//	}	
		}
		var fSize = 24;
			if(namestring.length > 28){
				fSize = 18
			}
			else if(namestring.length > 24){
				fSize= 20
			}else if(namestring.length > 18){
				fSize = 22
			}
		var lvst = {display: 'inline-block',fontSize: fSize,width: '310',background: '#5d5480',borderRadius: 20,textAlign: 'center', color: '#eee'}
		var st = this.props.vst;
			st.width = 536
			if(this.props.mobile){
				st.height = 45
				st.paddingRight = 5;
				st.lineHeight = '51px'
				lvst.lineHeight = '25px'
				lvst.verticalAlign = 'middle'
			}
		
		var dval = this.props.data[0]
		if(this.props.label){
			if(this.props.param[0]["@labels"] == 'DCRate'){
				var dclab = ['fastest','fast','med','slow'];
				dval = dclab[this.props.data[0]];
			}else if(_pVdef[6][this.props.param[0]["@labels"]][this.props.language]){
				if(_pVdef[6][this.props.param[0]["@labels"]][this.props.language][this.props.data[0]]){
					dval = _pVdef[6][this.props.param[0]["@labels"]][this.props.language][this.props.data[0]]
				}else{
					dval=_pVdef[6][this.props.param[0]["@labels"]]['english'][this.props.data[0]]
				}
			}else{
				dval=_pVdef[6][this.props.param[0]["@labels"]]['english'][this.props.data[0]]
			}
		}
		
			
			if(this.state.mode == 0){
				return <div onClick={this.switchMode}><label style={lvst}>{namestring + ": "}</label><label style={st}>{dval}</label></div>
			}else{
				if(this.props.label){
					var selected = this.state.val[0];
					//////////console.log(selected)
					if (this.props.param[0]["@labels"] == 'InputSrc'){
			//			//////console.log(['1795', 'Input Source bits'])
					}else if(this.props.param[0]["@labels"] == 'OutputSrc'){
			//			//////console.log(['1797', 'Output Source bits'])
					}
					var options = _pVdef[6][this.props.param[0]["@labels"]]['english'].map(function(e,i){
						if(i==selected){
							return (<option value={i} selected>{e}</option>)
						}else{
							return (<option value={i}>{e}</option>)
						}
					})
				//	var lvst = this.props.lvst
				/*	if((this.props.param[0]['@labels'] == 'FaultMaskBit')){
						if(this.props.faultBits.indexOf(this.props.param[0]['@name'].slice(0,-4)) != -1){
							lvst.color= '#ffa500'
						}
					}*/
					return(
						<div>
						<div onClick={this.switchMode}>
							<label style={lvst}>{namestring + ': '}</label><label style={st}> {dval}</label>
							</div>
							<div style={{marginLeft:this.props.lvst.width, width:this.props.vst.width}} className='customSelect'>
							<select onChange={this.valChangedl}>
							{options}
							</select>
							</div>
							</div>)

				}else{
					/*<input width={10} onKeyPress={this._handleKeyPress} style={{fontSize:18}} onChange={this.valChanged} type='text' value={this.state.val[0]}></input>*/
					var input = (<CustomKeyboard datetime={dt} language={this.props.language} ref={'keyboard'} tooltip={vMapV2[this.props.name]['@translations'][this.props.language]['description']} onInput={this.valChanged} label={this.state.val[0].toString()} value={this.state.val[0].toString()} num={num} onKeyPress={this._handleKeyPress} onFocus={this.onFocus} onRequestClose={this.onRequestClose} />)//
					
					return (<div> <div onClick={this.switchMode}><label style={lvst}>{namestring + ": "}</label><label style={this.props.vst}>{dval}</label></div>
					{input}
					</div>)	
			}
		}
	
	}
}
/*Input Controls End*/
class FRamView extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({dspName:'',XPortIp:'',internalIp:'',haloIp:'',ioIp:''})
	}	
	render(){
		return(<div></div>)
	}
	
}

class LiveView extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({rejects:0, mode:0, phase:90,pled:0,dled:0})
		this.update = this.update.bind(this);
		this.setLEDs = this.setLEDs.bind(this);
	}
	update (data) {
		this.refs.st.update(data)
	}
	setLEDs (p,d) {
		this.refs.st.setLEDs(p,d)
	}
	render(){
		var style = {fontSize:20}
		if(this.props.layout =='mobile'){
			style = {fontSize:16}
		}else if(this.props.layout == 'tab'){
			return (<div className='liveView' style={{fontSize:16, height:50, paddingTop:0}}>
			<table style={{width:'100%'}}><tbody><tr><td style={{width:280}}>
			{this.props.children}
			</td><td>
			<StatBar ref='st'/>
			</td></tr></tbody></table>
			</div>
			)
		}

		return (<div style={this.props.st} className='liveView' style={style}>
			{this.props.children}
			<StatBar ref='st'/>
			</div>
			)
	}
}
class LiveViewInt extends React.Component{
	constructor(props) {
		super(props)
		this.state =  ({rejects:0, mode:0, phase:90,pled:0,dled:0})
		this.update = this.update.bind(this);
		this.setLEDs = this.setLEDs.bind(this);
	}
	update (a,b) {
		this.refs.st.update(a,b)
	}
	setLEDs (pa,da,pb,db) {
		this.refs.st.setLEDs(pa,pb,da,db)
	}
	render(){
		var style = {fontSize:20}
		if(this.props.layout =='mobile'){
			style = {fontSize:16}
		}else if(this.props.layout == 'tab'){
			return (<div className='liveView' style={{fontSize:16, height:50, paddingTop:0}}>
			<table style={{width:'100%'}}><tbody><tr><td style={{width:280}}>
			{this.props.children}
			</td><td>
			<StatBarInt ref = 'st'/>
			</td></tr></tbody></table>
			</div>
			)
		}

		return (<div style={this.props.st} className='liveView' style={style}>
			{this.props.children}
			<StatBarInt ref = 'st'/>		
			</div>
			)
	}
}

class FaultDiv extends React.Component{
	constructor(props) {
		super(props)
		this.clearFaults = this.clearFaults.bind(this)
		this.maskFault = this.maskFault.bind(this)
	}
	clearFaults () {
		this.props.clearFaults()
	}
	maskFault (f) {
		this.props.maskFault(f)
	}
	render () {
		var self = this;
		var cont;
		var clButton;
		if(this.props.faults.length == 0){
			cont = (<div><label>No Faults</label></div>)
		}else{
			clButton = <button onClick={this.clearFaults}>Clear Faults</button>
			cont = this.props.faults.map(function(f){
				return <FaultItem maskFault={self.maskFault} fault={f}/>
			})
		}
		return(<div>
			{cont}
			{clButton}
		</div>)
	}
}

class Modal extends React.Component{
	constructor(props) {
		super(props)
		var klass = 'custom-modal'
		if(this.props.className){
			klass = this.props.className
		}
		this.state = ({className:klass, show:false, override:false ,keyboardVisible:false});
		this.toggle = this.toggle.bind(this);
		this.updateMeter =this.updateMeter.bind(this);
		this.updateSig = this.updateSig.bind(this);
		this.clear = this.clear.bind(this);
		this.show = this.show.bind(this);
		this.close = this.close.bind(this);
	}
	componentWillReceiveProps (newProps){
		if(typeof newProps.override != 'undefined'){
			if(newProps.override == 0){
				this.setState({show:false})
			}else{
				this.setState({show:true})
			}
			
		}
	}
	show(){
		this.setState({show:true})
	
	}
	close(){
		var self = this;
		////console.log(4530, self.props.onClose)
	
		this.setState({show:false})
		setTimeout(function(){
				if(typeof self.props.onClose != 'undefined'){
			
				self.props.onClose();
			}
			//hack - sometimes the open and close will fire simultaneously, disable closing in the 50 ms after opening
			self.setState({override:false})
			
		},50)
	}
	toggle () {
		var self = this;
		if(this.state.keyboardVisible){
			return
		}
		if(!this.state.override){
			if(this.state.show){
			/*	if(typeof self.props.onClose != 'undefined'){
			
					self.props.onClose();
				}
			this.setState({show:false, override:true})

		
			setTimeout(function(){
				//hack - sometimes the open and close will fire simultaneously, disable closing in the 50 ms after opening
				self.setState({override:false})
				
			},50)*/
				this.close()
			}else{
				this.setState({show:true, override:true})

		
				setTimeout(function(){
				//hack - sometimes the open and close will fire simultaneously, disable closing in the 50 ms after opening
				self.setState({override:false})

				},50)
			}
		}

		
	}
	updateMeter (a,b) {
		// body...
		if(this.state.show){
			this.refs.mb.update(a,b)
		}
		
	}
	clear (c) {
		// body...
		var p = 'Peak'
		if(c == 0){
			p = 'Peak_A'
		}else if(c == 1){
			p = 'Peak_B'
		}
		this.props.clear(c)
	}
	updateSig (a,b) {
		// body...
		if(this.state.show){
			if((typeof b != 'undefined')){
				if(this.refs.mb.state.sig != a || this.refs.mb.state.sigB != b){
					this.refs.mb.setState({sig:a,sigB:b})
				}
			}else{
				if(this.refs.mb.state.sig != a ){
					this.refs.mb.setState({sig:a})
				}
			}
		}
		
	}
	render () {
		var cont = '';
		var h = !this.state.show
		if(typeof this.props.override != 'undefined'){
			if(this.props.override == 1){
				h = false
			}else{
				h = true
			}
		}


		if(!h){
			var im =''
			if(this.props.intMeter){
				im = <InterceptorMeterBar ref='mb' clear={this.clear} mobile={this.props.mobile}/>
			}
			if(this.props.dfMeter){
				im = <StealthMeterBar ref='mb' clear={this.clear} mobile={this.props.mobile}/>
			}
				cont = (<ModalCont toggle={this.toggle} Style={this.props.Style} innerStyle={this.props.innerStyle} mobile={this.props.mobile}>
					{im}
			
			{this.props.children}
		</ModalCont>)
		

		return(<div className={this.state.className} hidden={h}>
		{/*	<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>*/}
			{cont}
	</div>)
	}
	else{
		return null;
	}
	}
}
class ModalC extends React.Component{
	constructor(props){
		super(props);
		this.state = {keyboardVisible:false}
		this.toggle = this.toggle.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
	}
	toggle(){
		this.props.toggle()
	}
	handleClickOutside(e){
		if(!this.state.keyboardVisible){
			this.props.toggle();	
		}	
	}
	render() {
		var style= this.props.Style || {}
		var cs = this.props.innerStyle || {}
		var button = ''
		
		if(this.props.mobile){
			cs.padding = 7;
			cs.maxHeight = '83%'
			cs.overflow = 'scroll'
			style.maxHeight = '83%'
			style.overflow = 'scroll'
			button = <button className='modal-close' onClick={this.toggle}><img className='closeIcon' src='assets/Close-icon.png'/></button>
		}

				return (<div className='modal-outer' style={style}>
					{button}
				<div className='modal-content' style={cs}>
					{this.props.children}
				</div>
				</div>)
	
	}
}
var ModalCont = onClickOutside(ModalC);

class StatBar extends React.Component{
	constructor(props) {
		super(props)
		this.update = this.update.bind(this)
		this.setLEDs = this.setLEDs.bind(this)
	}
	update (data) {
		this.refs.tb.update(data)
	}
	setLEDs (p,d) {
		this.refs.lb.update(p,d)
	}
	render(){
		return (<div className='statBar'>
			<TickerBox ref='tb' int={false}/>
			<LEDBar ref='lb'/>
			</div>)
	}
}
class StatBarInt extends React.Component{
	constructor(props) {
		super(props)
			this.update = this.update.bind(this)
		this.setLEDs = this.setLEDs.bind(this)
	
	}
	update (a,b) {
		this.refs.ta.update(a)
		this.refs.tb.update(b)
	}
	setLEDs (pa,pb,da,db) {
		this.refs.lb.update(pa,pb,da,db)
	}
	render(){
		return (<div className='statBar'>
			<TickerBox ref='ta' int={true} color='#800080'/>
			<TickerBox ref='tb' int={true} color='#008080'/>
			<LEDBarInt ref='lb'/>
			</div>)
	}
}
	
class MultiBankUnit extends React.Component{
	constructor(props) {
		super(props)
		var dat = []
		if(this.props.data.length >0){
			dat = this.props.data
			//////////console.log(dat)
		}
		this.state =  ({banks:dat})
		this.onRMsg = this.onRMsg.bind(this);
		this.onParamMsg2 = this.onParamMsg2.bind(this);
	}
	onRMsg (e,d) {
		// body...
		if(this.refs[d.mac]){
			//////////console.log(d)
			this.refs[d.mac].onRMsg(e,d)
	
		}
	}
	onParamMsg2(e,d){
		if(this.refs[d.mac]){
			////////////console.log(d)
			this.refs[d.mac].onParamMsg2(e,d)
	
		}
		e = null;
		d = null;

	}
	componentWillReceiveProps (nextProps) {
		this.setState({banks:nextProps.data})
	}
	switchUnit (u) {
		this.props.onSelect(u)
	}
	render (argument) {
		var self = this;
		var banks = this.state.banks.map(function (b,i) {
			return <StatBarMB unit={b} onSelect={self.switchUnit} ref={b.mac} name={b.name}/>
		})
		return (<div className='multiBankUnit'>
			<div className='nameLabel'>
				<label>{this.props.name}</label></div>
			{banks}</div>)
	

	}
}
class StatBarMB extends React.Component{
	constructor(props) {
		super(props)
		var br = window.matchMedia('(min-width:600px)')
		br.addListener(this.listenToMq)
		var interceptor = this.props.unit.interceptor;//(vdefByMac[this.props.unit.ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2)//(this.props.unit.board_id == 5)
		this.state = ({pn:'',phase_A:9000, phase_B:9000, phasemode_A:0, phasemode_B:0,sens_A:100,sens_B:100, peak_A:0,peak_B:0,br:br, mobile:br.matches, interceptor:interceptor, rejs:2, fault:false, live:false, pled_A:0,dled_A:0,pled_B:0,dled_B:0, rpcResp:false})
		this.update = this.update.bind(this)
		this.updateMeter = this.updateMeter.bind(this)
		this.setLEDSInt = this.setLEDSInt.bind(this)
		this.setLEDS = this.setLEDS.bind(this)
		this.setDyn = this.setDyn.bind(this)
		this.listenToMq = this.listenToMq.bind(this)
		this.setDynInt =this.setDynInt.bind(this);
		this.setProdVars = this.setProdVars.bind(this);
		this.setProdVarsInt = this.setProdVarsInt.bind(this);
		this.onRMsg = this.onRMsg.bind(this)
		this.switchUnit = this.switchUnit.bind(this);
		this.onParamMsg2 = this.onParamMsg2.bind(this)
	}
	listenToMq () {
		this.setState({mobile:this.state.br.matches});
	}
	update (data) {
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		this.refs.lv.update(data)
	}
	setDyn(phase,pk,rc,fa){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk) || (this.state.rejs != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs:rc,fault:faults})
		}
	}
	updateMeter (dat) {
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		this.refs.lv.update(dat)
	}
	setLEDSInt(det_a,prod_a,prodhi_a,det_b,prod_b,prodhi_b){
		var pled_a = 0
		if(prodhi_a == 1){
			pled_a = 2
		}else if(prod_a == 1){
			pled_a = 1
		}
		var pled_b = 0
		if(prodhi_b == 1){
			pled_b = 2
		}else if(prod_b == 1){
			pled_b = 1
		}
		this.refs.lv.setLEDs(pled_a,det_a,pled_b,det_b)
	}
	setDynInt(phase,pk,rc,fa,phase_b,pk_b){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk)||(phase_b!=this.state.phase_B)||(this.state.peak_B != pk_b) || (this.state.rejs != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs:rc,fault:faults, phase_B:phase_b,peak_B:pk_b})
		}
	}
	setProdVars(pn,sns,pm){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.phasemode_A != pm)){
			this.setState({pn:pn, sens_A:sns, phasemode_A:pm})
		}
	}
	setProdVarsInt(pn,sns, snsb,pm, pmb){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.sens_B != snsb)||(this.state.phasemode_A != pm)||(this.state.phasemode_B != pmb)){
			this.setState({pn:pn, sens_A:sns,sens_B:snsb, phasemode_A:pm,phasemode_B:pmb})
		}
	}
	setLEDS(det,prod,prodhi){
		var pled = 0
		if(prodhi == 1){
			pled = 2
		}else if(prod == 1){
			pled = 1
		}
		this.refs.lv.setLEDs(pled,det)
	}
	switchUnit () {
		// body...
		if(this.state.live){
			this.props.onSelect(this.props.unit)	
		}
		
	}
	componentDidMount () {
		// body...
		var self = this;
		var packet = dsp_rpc_paylod_for(19,[102,0,0])
		myTimers[this.props.unit.mac] = setInterval(function(){
			if((Date.now()-liveTimer[self.props.unit.mac])>1000){
				self.setState({live:false})
			}
			if(!self.state.rpcResp){
				socket.emit('rpc',{ip:self.props.unit.ip, data:packet});	
			}
			
		},1000)
			
	}
	componentWillUnmount () {
		clearInterval(myTimers[this.props.unit.mac]);
	}
	onRMsg (e,d) {
		// body...
		if(d.mac = this.props.unit.mac){
			clearInterval(myTimers[this.props.unit.mac]);
			this.setState({rpcResp:true})	
		}		
		e = null;
		d = null;

	}
	onParamMsg2(e){
		

		var self = this;
   		var res = vdefByMac[this.props.unit.mac]
		var lcd_type = e.type
		var rec = e.rec
		if(res){
			var pVdef = res[1]
			if(lcd_type == 1){
				if(!this.state.interceptor){
					this.setProdVars(rec['ProdName'],rec['Sens'],rec['PhaseMode'])
				}else{
					this.setProdVarsInt(rec['ProdName'],rec['Sens_A'],rec['PhaseMode_A'],rec['Sens_B'],rec['PhaseMode_B'])
				}
				

			}else if(lcd_type == 2){
				var faultArray = [];
				pVdef[7].forEach(function(f){
					if(rec[f] != 0){
						faultArray.push(f)
					}
				});
				if(!this.state.interceptor){
					this.setDyn(uintToInt(rec['PhaseAngleAuto'],16),rec['Peak'], rec['RejCount'], faultArray)
					this.updateMeter(uintToInt(rec['DetectSignal'],16))
					this.setLEDS(rec['Reject_LED'],rec['Prod_LED'],rec['Prod_HI_LED'])
				}else{
					this.updateMeterInt(uintToInt(rec['DetectSignal_A'],16),uintToInt(rec['DetectSignal_B'],16))
					this.setDynInt(uintToInt(rec['PhaseAngleAuto_A'],16),rec['Peak_A'], rec['RejCount'], faultArray, uintToInt(rec['PhaseAngleAuto_B'],16),rec['Peak_B'], rec['RejCount'], faultArray)
					this.setLEDSInt(rec['Reject_LED_A'],rec['Prod_LED_A'],rec['Prod_HI_LED_A'],rec['Reject_LED_B'],rec['Prod_LED_B'],rec['Prod_HI_LED_B'])
				}
				faultArray = null;
			}
		}
		
		e = null;
		rec = null;
		res = null;

	}
	render(){

		if(!this.state.mobile){
			return this.renderMob();
		}else{
			return this.renderTab();
		}
	
	}
	renderTab () {
		// body...
		var klass =''
		if(this.state.fault){
			klass = 'faultactive'
			//////////console.log(klass)
		}
		if(!this.state.live){

			klass = 'inactive'
			//////////console.log(klass)
		}
		var list = ['dry','wet','DSA']
		var mtab = (	<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens_A}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A]}</label></td></tr>
				<tr><td><label>Peak:{this.state.peak_A}</label></td>
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs}</label></td></tr></tbody></table>
				)
		if(!this.state.interceptor){
				return(
				<div onClick={this.switchUnit} className={klass}>
				<LiveView ref='lv' layout='tab'>
					{mtab}
				</LiveView>
				</div>)	
		}else{
			return(
				<div onClick={this.switchUnit} className={klass}>
				<LiveViewInt ref='lv' layout='tab'>
					{mtab}
				</LiveViewInt>
				</div>)
		}
	

	}
	renderMob () {
		var klass =''
		if(this.state.fault){
			klass = 'faultactive'
		}
		if(!this.state.live){
			klass = 'inactive'
		}
		var list = ['dry','wet','DSA']
		var mtab = (	<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase/100).toFixed(2).toString() +' ' +list[this.state.phasemode]}</label></td>
			</tr>
				<tr><td><label>Peak:{this.state.peak}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs}</label></td>

				</tr></tbody></table>)
		
		if(!this.state.interceptor){
			return (
			<div onClick={this.switchUnit} className={klass}>
				<LiveView ref='lv' layout='mobile'>
				{mtab}
				</LiveView>
			</div>)
		}else{
			return (
			<div onClick={this.switchUnit} className={klass}>
				<LiveViewInt ref='lv' layout='mobile'>
				{mtab}
				</LiveViewInt>
			</div>)
		}
		
	}
}
class SingleUnit extends React.Component{
	constructor(props) {
		super(props)
		// body...
		var mobMqs = [
			window.matchMedia('(min-width:321px)'),
			window.matchMedia('(min-width:376px)'),
			window.matchMedia('(min-width:426px)')
		]
		for(var i = 0; i<3;i++){
			mobMqs[i].addListener(this.listenToMq)
		}
		var font;
		if(mobMqs[2].matches){
			font = 3
		}else if(mobMqs[1].matches){
			font = 2
		}else if(mobMqs[0].matches){
			font = 1
		}else{
			font = 0
		} 
		var interceptor =  this.props.unit.interceptor//(vdefByMac[this.props.unit.ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2)//(this.props.unit.board_id == 5)
		this.state = ({font:font,mq:mobMqs,phasemode_A:0,live:false, fault:false, pn:'', sens_A:0,peak_A:0,rejs_A:0,phase_A:0,pled_A:0,dled_A:0,
			sens_B:0,peak_B:0,rejs_B:0,phase_B:0,pled_B:0,dled_B:0,rpcResp:false, interceptor:interceptor})
		this.onClick = this.onClick.bind(this);
		this.listenToMq = this.listenToMq.bind(this);
		this.updateMeter = this.updateMeter.bind(this);
		this.updateMeterInt = this.updateMeterInt.bind(this);
		this.onRMsg = this.onRMsg.bind(this);
		this.onParamMsg2 = this.onParamMsg2.bind(this);
		this.onFault = this.onFault.bind(this);
		this.setProdVars = this.setProdVars.bind(this);
		this.setProdVarsInt = this.setProdVarsInt.bind(this);
		this.setLEDS = this.setLEDS.bind(this);
		this.setDyn = this.setDyn.bind(this);
		this.setLEDSInt = this.setLEDSInt.bind(this);
		this.setDynInt = this.setDynInt.bind(this);
	}
	onClick () {
		if(this.state.live){
			this.props.onSelect(this.props.unit)
	
		}
	}
	listenToMq () {
		// body...
		var mobMqs = this.state.mq
			var font;
		if(mobMqs[2].matches){
			font = 3
		}else if(mobMqs[1].matches){
			font = 2
		}else if(mobMqs[0].matches){
			font = 1
		}else{
			font = 0
		} 
		this.setState({font:font})
	}
	updateMeter (dat) {
		// body...
		liveTimer[this.props.unit.mac] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		this.refs.lv.update(dat)
	}
	updateMeterInt(a,b){
		liveTimer[this.props.unit.mac] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		////////////console.log([a,b])
		this.refs.lv.update(a,b)	
	}
	onRMsg (e,d) {
		clearInterval(myTimers[this.props.unit.mac]);
		this.setState({rpcResp:true})
	}
	onParamMsg2(e){
		var self = this;
		var res = vdefByMac[this.props.unit.mac]
		var lcd_type = e.type
		var rec = e.rec
	//		//console.log(['4480',this.props.unit.mac, res])
   	
		////////console.log(['2767',e])
		if(res){
			var pVdef = res[1]
			if(lcd_type == 1){
				if(!this.state.interceptor){
					this.setProdVars(rec['ProdName'],rec['Sens'],rec['PhaseMode'])
				
					
				}else{
					this.setProdVarsInt(rec['ProdName'],rec['Sens_A'],rec['PhaseMode_A'],rec['Sens_B'],rec['PhaseMode_B'])	
				}
				

			}else if(lcd_type == 2){
				var faultArray = [];
				pVdef[7].forEach(function(f){
					if(rec[f] != 0){
						faultArray.push(f)
					}
				});
				if(!this.state.interceptor){
					this.setDyn(uintToInt(rec['PhaseAngleAuto'],16),rec['Peak'], rec['RejCount'], faultArray)
					this.updateMeter(uintToInt(rec['DetectSignal'],16))
					this.setLEDS(rec['Reject_LED'],rec['Prod_LED'],rec['Prod_HI_LED'])
				}else{
					this.updateMeterInt(uintToInt(rec['DetectSignal_A'],16),uintToInt(rec['DetectSignal_B'],16))
					this.setDynInt(uintToInt(rec['PhaseAngleAuto_A'],16),rec['Peak_A'], rec['RejCount'], faultArray, uintToInt(rec['PhaseAngleAuto_B'],16),rec['Peak_B'], rec['RejCount'], faultArray)
					this.setLEDSInt(rec['Reject_LED_A'],rec['Prod_LED_A'],rec['Prod_HI_LED_A'],rec['Reject_LED_B'],rec['Prod_LED_B'],rec['Prod_HI_LED_B'])
				}
				faultArray = null;
			}
		}
		rec = null;
		res = null;
		e = null;
	}
	onFault () {
		//
		this.setState({fault:!this.state.fault})
	}
	componentDidMount () {
		var self = this;
		this._isMounted = true;
		myTimers[this.props.unit.mac] = setInterval(function(){
			////console.log('4596', self.state.rpcResp)
			if((Date.now() - liveTimer[self.props.unit.mac]) > 1500){
				self.setState({live:false})
			}
			if(!self.state.rpcResp){
				var packet = dsp_rpc_paylod_for(19,[102,0,0])
				socket.emit('rpc',{ip:self.props.unit.ip, data:packet})
			}
		}, 1500)
	}
	componentWillUnmount () {
		clearInterval(myTimers[this.props.unit.mac]);
	}
	setProdVars(pn,sns,pm){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.phasemode_A != pm)){
			this.setState({pn:pn, sens_A:sns, phasemode_A:pm})
		}
	}
	setProdVarsInt(pn,sns, snsb,pm, pmb){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.sens_B != snsb)||(this.state.phasemode_A != pm)||(this.state.phasemode_B != pmb)){
			this.setState({pn:pn, sens_A:sns,sens_B:snsb, phasemode_A:pm,phasemode_B:pmb})
		}
	}
	setLEDS(det,prod,prodhi){
		var pled = 0
		if(prodhi == 1){
			pled = 2
		}else if(prod == 1){
			pled = 1
		}
		this.refs.lv.setLEDs(pled,det)
	}
	setDyn(phase,pk,rc,fa){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk) || (this.state.rejs_A != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs_A:rc,fault:faults})
		}
	}
	setLEDSInt(det_a,prod_a,prodhi_a,det_b,prod_b,prodhi_b){
		var pled_a = 0
		if(prodhi_a == 1){
			pled_a = 2
		}else if(prod_a == 1){
			pled_a = 1
		}
		var pled_b = 0
		if(prodhi_b == 1){
			pled_b = 2
		}else if(prod_b == 1){
			pled_b = 1
		}
		this.refs.lv.setLEDs(pled_a,det_a,pled_b,det_b)
	}
	setDynInt(phase,pk,rc,fa,phase_b,pk_b){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk)||(phase_b!=this.state.phase_B)||(this.state.peak_B != pk_b) || (this.state.rejs_A != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs_A:rc,fault:faults, phase_B:phase_b,peak_B:pk_b})
		}
	}
	render(){
		var classname = 'multiScanUnit'
		if(!this.state.live){
			classname = 'multiScanUnit inactive'
		}else if(this.state.fault){
			classname = 'multiScanUnit faultactive'
		}
		var st= {fontSize:20};
		if(this.state.font == 2){
			st = {fontSize:20, height:160}
		}else if(this.state.font == 1){
			st = {fontSize:18, height:145}
		}else if(this.state.font == 0){
			st = {fontSize:16, height:145}
		}
		if(this.state.interceptor){
			return this.renderInt(classname, st)
		}else{
			return this.renderST(classname, st)
		}
	}
	renderInt(classname,st){

		var list = ['dry','wet','DSA']
		return(<div className={classname}>
			<LiveViewInt st={st} ref = 'lv'>
			<div onClick={this.onClick}>
			<div><label>Name: </label><label>{this.props.unit.name}</label></div>
				<div><label>Product:{this.state.pn}</label></div>
				<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens_A+ "  "+ this.state.sens_B}</label></td><td><label style={{paddingLeft:15, display:'none'}}>Phase:{(this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A] 
				+ "  "+ (this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A]}</label></td>
			</tr>
				<tr><td><label>Peak:{this.state.peak_A+ "  "+ this.state.peak_B}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs_A}</label></td>

				</tr></tbody></table>
			</div>
			</LiveViewInt>
			</div>)
	}
	renderST (classname,st) {
		
		var list = ['dry','wet','DSA']
		return(<div className={classname}>
			<LiveView st={st} ref='lv'>
			<div  onClick={this.onClick}>
				<div><label>Name: </label><label>{this.props.unit.name}</label></div>
				<div><label>Product:{this.state.pn}</label></div>
				<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens_A}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A]}</label></td>
			</tr>
				<tr><td><label>Peak:{this.state.peak_A}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs_A}</label></td>

				</tr></tbody></table>
				</div>
			</LiveView>
		</div>)
	}
}
class DetItemView extends React.Component{
	constructor(props) {
		super(props)
		this.addClick = this.addClick.bind(this)
	}
	addClick () {
		// body...
		this.props.addClick(this.props.i)
	}
	render () {
		var addText = 'Add'
		if(this.props.type == 1){
			addText = 'Remove'
		}
		return (<div style={{padding:5, lineHeight:1.8, fontSize:25}}>
				<label onClick={this.addClick}>{this.props.det.name}</label>
			</div>)
	}
}
class MBGroupView extends React.Component{
	constructor(props) {
		super(props)
		this.state =  {font:2}
	}

	render() {
		var banks = this.props.unit.banks;
		var lab = "Config Multibank Unit"
		var tstl = {display:'inline-block', textAlign:'center'}
	    var titlediv = (<span><h2 style={{textAlign:'center'}} ><div style={tstl}>{lab}</div></h2></span>)
	    if (this.state.font == 1){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:30}} ><div style={tstl}>{lab}</div></h2></span>)
	    }else if (this.state.font == 0){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:24}} ><div style={tstl}>{lab}</div></h2></span>)
	    }
		return(<div className='settingsDiv'>
				<div className='menuCategory'>
				{titlediv}
				<TreeNode nodeName="Config banks">
					{this.props.unit.name}
				</TreeNode>
			</div>
		</div>)
	}
}
class MbSetup extends React.Component{
		constructor(props) {
			super(props)
			this.state = ({mode:false})
			this.editMb = this.editMb.bind(this);
			this.remove = this.remove.bind(this);
			this.moveUp = this.moveUp.bind(this);
			this.moveDown = this.moveDown.bind(this);
			this.toggleOptions = this.toggleOptions.bind(this);
		}
		editMb () {
			//////////console.log(this.props.index)
			this.props.edit(this.props.index)
		}
		remove () {
			this.props.remove(this.props.index)
		}
		moveUp () {
			this.props.move(this.props.index,'up')
		}
		moveDown (){
			this.props.move(this.props.index,'down')
		}
		toggleOptions () {
			this.setState({mode:!this.state.mode})
		}
		render () {
			var editRow;
			if(this.state.mode){
				editRow = (<div>
					<button onClick={this.editMb}>Edit</button>
					<button onClick={this.remove}>Remove</button>
					<button onClick={this.moveUp}>move up</button>
					<button onClick={this.moveDown}>move down</button>
					</div>)
			}
			return (<div className="sItem" onClick={this.toggleOptions}>
						<label>Name:{this.props.mb.name}</label>
						{editRow}
					</div>)	
		}
}
class InterceptorMainPageResponsivUI extends React.Component{
	render(){
		return <div>
			<InterceptorDynamicViewDFResponsive/>

		</div>
	}
}
class InterceptorDynamicViewDFResponsive extends React.Component{
	render(){
	var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'start'}
		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		var klass = 'interceptorDynamicView'
		var bcolor = 'black';
		var pled = ['#e1e1e1', '#6eed6e', '#ee0000']
		if(this.props.faultArray.length >0){
			if(this.props.faultArray.length > this.props.warningArray.length){

			}else{
				//warning should look different?
			}
			klass = 'interceptorDynamicView_f'
		}else if(this.props.rejOn == 1){
			klass = 'interceptorDynamicView_r'
		}else if(this.props.testReq == 1){
			klass = 'interceptorDynamicView_t'
		}else if(this.props.testReq == 2){
			klass = 'interceptorDynamicView_tf'
		}
		if(this.state.cipSec == 1){
			klass = 'InterceptorDynamicView_tf'
		}
		// accessControl
		var sensacc = (this.props.sys['PassAccSens'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 3);
		var rejacc = (this.props.sys['PassAccClrRej'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 3);
		return (
			<div style={{marginTop:2}}>
				<div className={klass} style={{overflow:'hidden',display:'block',borderRadius:20,marginLeft:'auto',marginRight:'auto', textAlign:'center'}}></div>
			</div>)
	}
}
class DetectorView extends React.Component{
	constructor(props) {
		super(props)
		this.mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 467px)'),
			window.matchMedia('(min-width: 600px)')
		]
		this.minMq = window.matchMedia("(min-width: 400px)");
		for (var i=0; i<3; i++){
			this.mqls[i].addListener(this.listenToMq)
		}
		this.landScape = window.matchMedia("(orientation: landscape)");
		this.minMq.addListener(this.listenToMq.bind(this));
		this.landScape.addListener(this.listenToMq.bind(this));
		var interceptor = this.props.det.interceptor//(vdefByMac[this.props.det.ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2)//(this.props.det.board_id == 5);
		this.state =  {callback:null, rec:{},offline:true, landScape:this.landScape.matches,showTest:false, warningArray:[],faultArray:[],pind:0,currentView:'MainDisplay', data:[], stack:[], pn:'', sens:0, netpoll:this.props.netpolls, 
			prodSettings:{}, sysSettings:{}, combinedSettings:[],cob2:[], pages:{}, showCal:false,userid:0, isUpdating:false, username:'Not Logged In', isSyncing:false,
			minW:this.minMq.matches, br:this.props.br, fault:false, usb:false, usernames:[{username:'ADMIN',acc:4}], broadCast:false,
			peak:0, rej:0, phase:0, interceptor:interceptor, ioBITs:{}, testRec:{},framRec:{}, updateCount:0, language:0,rejOn:0,showSens:false,level:0, trec:0, loginOpen:false}
		this.sendPacket = this.sendPacket.bind(this);
		this.onRMsg = this.onRMsg.bind(this);
		this.toggleAttention = this.toggleAttention.bind(this);
		this.onNetpoll = this.onNetpoll.bind(this);
		this.listenToMq = this.listenToMq.bind(this);
		this.getCob = this.getCob.bind(this);
		this.getPages = this.getPages.bind(this);
		this.getPage = this.getPage.bind(this);
		this.onParamMsg3 = this.onParamMsg3.bind(this);
		this.setLEDS = this.setLEDS.bind(this);
		this.setLEDSInt = this.setLEDSInt.bind(this);
		this.showSettings = this.showSettings.bind(this);
		this.showSens = this.showSens.bind(this);
		this.showTestModal = this.showTestModal.bind(this);
		this.logoClick = this.logoClick.bind(this);
		this.changeView = this.changeView.bind(this);
		this.settingClick = this.settingClick.bind(this);
		this.goBack = this.goBack.bind(this);
		this.clear = this.clear.bind(this);
		this.settingsClosed = this.settingsClosed.bind(this);
		this.onCalFocus = this.onCalFocus.bind(this);
		this.onCalClose = this.onCalClose.bind(this);
		this.clearSig = this.clearSig.bind(this);
		this.setOverride = this.setOverride.bind(this);
		this.setTOverride = this.setTOverride.bind(this);
		this.setCOverride = this.setCOverride.bind(this);
		this.setSOverride = this.setSOverride.bind(this);
		this.toggleTestSettings = this.toggleTestSettings.bind(this);
		this.toggleCalSettings = this.toggleCalSettings.bind(this);
		this.getProdName = this.getProdName.bind(this);
		this.setLanguage = this.setLanguage.bind(this);
		this.showCalibModal = this.showCalibModal.bind(this);
		this.clearFaults = this.clearFaults.bind(this);
		this.clearWarnings = this.clearWarnings.bind(this);
		this.sendOp = this.sendOp.bind(this);
		this.sendAck = this.sendAck.bind(this);
		this.quitTest = this.quitTest.bind(this);
		this.calClosed = this.calClosed.bind(this);
		this.tmClosed = this.tmClosed.bind(this);
		this.snmClosed = this.snmClosed.bind(this);
		this.showTestRModal = this.showTestRModal.bind(this);
		this.getTestText = this.getTestText.bind(this);
		this.onSens = this.onSens.bind(this);
		this.toggleSensSettings = this.toggleSensSettings.bind(this);
		this.toggleLogin = this.toggleLogin.bind(this);
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.authenticate = this.authenticate.bind(this);
		this.setAuthAccount = this.setAuthAccount.bind(this);
		this.syncPrompt = this.syncPrompt.bind(this);
		this.startSync = this.startSync.bind(this);
		this.startUpdate = this.startUpdate.bind(this);
		this.cancelSync = this.cancelSync.bind(this);
		this.loginClosed = this.loginClosed.bind(this);


	}

	componentDidMount(){
		var self = this;
		ifvisible.setIdleDuration(300);
		ifvisible.on("idle", function(){
			if(self.refs.im){
				self.refs.im.pauseGraph()
			}
			self.logout()
		});
		ifvisible.on('wakeup', function(){
			if(self.refs.im){
				//console.log('wakeup')
				self.refs.im.restart()
			}
		})
		ifvisible.onEvery(5,function(){
			//send keepalive
			if(self.state.userid != 0){
				if(ifvisible.getIdleInfo().timeLeft > 294899){		
					self.setAuthAccount({level:self.state.level, username:self.state.username, user:self.state.userid - 1});
				}
			}
		});

		this._isMounted = true;
		myTimers[this.props.det.mac] = setInterval(function(){
			if((Date.now() - liveTimer[self.props.det.mac]) > 1500){
				if(!self.state.isUpdating){
					if(self.state.broadCast){
						socket.emit('locateReq')
						self.setState({broadCast:false, offline:true, update:true});
					}else{
						socket.emit('locateUnicast', self.props.det.ip)
						self.setState({broadCast:true,offline:true, update:true});
					}
				}		
			}else{
				self.setState({broadCast:false, update:false})
			}
		},1500)
		socket.on('usbdetect',function(){
			self.setState({usb:true,update:true})
			self.syncPrompt()	
		})
		socket.on('usbdetach',function(){
			self.setState({usb:false,update:true})
		})
		socket.on('doneUpdate',function(){
			self.setState({isUpdating:false, update:true})
		})
		socket.on('startUpdate',function(){
			self.setState({isUpdating:true, update:true})
		})
		socket.on('doneSync',function(){
			self.setState({isSyncing:false, update:true})
		})
		socket.on('startSync',function(){
			self.setState({isSyncing:true, update:true})
		})
	}
	componentWillUnmount () {
		ifvisible.off('idle');
		ifvisible.off('wakeup')
		ifvisible.onEvery().stop();
		clearInterval(myTimers[this.props.det.mac]);
	}
	syncPrompt(){
		this.refs.syncModal.toggle();
	}
	startSync(){
		socket.emit('syncStart', this.props.det)
		this.setState({isSyncing:true, update:true})
		this.refs.syncModal.close();
	}
	startUpdate(){
		socket.emit('startUpdate', this.props.det)
		this.setState({isUpdating:true, update:true})
		this.refs.syncModal.close();
	}
	cancelSync(){
		this.refs.syncModal.close();
	}

	componentWillReceiveProps (newProps) {
	
		var rec = this.state.framRec;
		rec['Nif_gw'] = newProps.nifgw;
		rec['Nif_nm'] = newProps.nifnm;
		rec['Nif_ip'] = newProps.nifip;
		//rec['Disp_Ver'] = newProps.dispVer;
	//	//console.log(4954, rec)
		var cob2 = this.getCob(this.state.sysSettings, this.state.prodSettings, this.state.rec, rec)

		this.setState({netpoll:newProps.netpolls, framRec:rec,cob2:cob2, update:true})
	}
	setAuthAccount(pack){
	//	//console.log(['4780',pack])

		var rpc = vdefByMac[this.props.mac][0]['@rpc_map']['KAPI_RPC_USERLOGIN']
		var pkt = rpc[1].map(function (r) {
			if(!isNaN(r)){
				return r
			}else{
				return pack.user
			}
		});
		//console.log('login packet', pkt)
		var packet = dsp_rpc_paylod_for(rpc[0],pkt);
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		if(this.state.userid != pack.user+1){
			this.setState({level:pack.level, username:pack.username, update:true, userid:pack.user+1})
		}		
		
	}
	logout(){
		this.refs.fModal.close();
		this.refs.tModal.close();
		this.refs.teModal.close();
		this.refs.sModal.close();
		this.refs.snModal.close();
		this.refs.calibModal.close();
		this.refs.im.refs.pedit.close();
		this.refs.im.refs.netpolls.close();		
		if(this.state.level != 0){

			toast("Logged out")
			var rpc = vdefByMac[this.props.mac][0]['@rpc_map']['KAPI_RPC_USERLOGOUT']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			this.setState({level:0, userid:0, username:'Not Logged In',update:true})

		}
	}
	toggleAttention () {
		this.refs.fModal.toggle();
	}
	onRMsg (e,d) {
		if(this.props.det.ip != d.ip){
			return;
		}
		var msg = e.data
		var data = new Uint8Array(msg);
	//	//////console.log(['3489',data])
		if(data[1] == 18){
			//prodList

	//		//////console.log('prodList')
			var prodbits = data.slice(3)
			var dat = []
			for(var i = 0; i < 99; i++){
			if(prodbits[i] ==2){
					dat.push(i+1)
				}
			}
			if(this.refs.im){
				this.refs.im.setProdList(dat)
				
			}

		}else if(data[1] == 24){
			if(this.state.callback){
				this.state.callback(data, this.state.pind)
			}
		}
		
		e = null;
		msg = null;
		data = null;
		dat = null;
		prodbits = null;
	}
	onNetpoll(e,d){
		if(this.props.det.ip != d.ip){
			return;	
		}
		var nps = this.state.netpoll
		if(nps.length == 15){
			nps.splice(1,-1);
		}
		nps.unshift(e);
		this.setState({netpoll:nps, update:true})
	}
	listenToMq () {
		var landscape = window.matchMedia('(orientation: landscape)');
		var minMq = window.matchMedia("(min-width: 400px)");
		this.setState({minW:minMq.matches, landScape:landscape.matches, update:true})	
	}
	getCob (sys,prod,dyn, fram) {
		// body...

		var vdef = vdefByMac[this.props.det.mac]
		var _cvdf = JSON.parse(JSON.stringify(vdef[4][0]))
		var cob =  iterateCats2(_cvdf, vdef[1],sys,prod, vdef[5],dyn,fram)
		vdef = null;
		_cvdf = null;
	//	//console.log('5556',cob)
		return cob

	}
	getPages (sys,prod,dyn, fram) {
		// body...
		var vdef = vdefByMac[this.props.det.mac]
		var _pages = JSON.parse(JSON.stringify(vdef[6]))
		var pages = {}
		for(var pg in _pages){
			pages[pg] = iterateCats2(_pages[pg], vdef[1],sys,prod, vdef[5],dyn, fram)
		}
		vdef = null;
		_pages = null;
		return pages
	}
	getPage (pg,sys,prod,dyn, fram) {
		// body...
		var vdef = vdefByMac[this.props.det.mac]
		var _page = JSON.parse(JSON.stringify(vdef[6][pg]))
		var page = {}
		page = iterateCats2(_page, vdef[1],sys,prod, vdef[5],dyn, fram)
	
		vdef = null;
		_page = null;
		return page
	}
	onParamMsg3 (e,d) {
		////console.log('on Param Msg 3',d)
		if(this.props.det.ip != d.ip){
			return;
		}
		var sysSettings =  null;//this.state.sysSettings;
		var prodSettings = null;//this.state.prodSettings;
		var combinedSettings = null;
		var self = this;
   		var lcd_type = e.type;
   		liveTimer[this.props.det.mac] = Date.now();
		if(this.state.offline){
			this.setState({offline:false, update:true})
		}
  	    if(lcd_type== 0){
 			//////console.log('sys')
			if(vdefByMac[d.mac]){
				var sysSettings = e.rec
    			var pages;// = {}
    			var cob2;// = iterateCats(_cvdf[0], pVdef, sysRec, this.state.prodSettings, _vmap, this.state.rec)
   
    				if(this.refs.sd){
						this.refs.sd.parseInfo(sysSettings, this.state.prodSettings)	
					}
					
					if(this.refs.im){
						this.refs.im.parseInfo(sysSettings, this.state.prodSettings)
					}	
				if(isDiff(sysSettings,this.state.sysSettings)){
					cob2 = this.getCob(sysSettings, this.state.prodSettings, this.state.rec, this.state.framRec);
					pages = this.getPages(sysSettings, this.state.prodSettings, this.state.rec, this.state.framRec);
					//var langs = ['english','french','spanish','portuguese','german','italian','polish','turkish']
					var lang = sysSettings['Language']
					this.setState({sysSettings:sysSettings,cob2:cob2, pages:pages, updateCount:0,update:true,language:lang})
				}
			
    		}  
    		sysSettings = null;
		}else if(lcd_type == 1){
			//console.log('heeeeeyy')
			if(vdefByMac[d.mac]){
				var prodRec = e.rec;
				var dccoeffA = prodRec['DcCoeffNorm_A']
    			var dccoeffB = prodRec['DcCoeffNorm_B']
    			var dcrateA = 2
    			var dcrateB = 2
    			if(dccoeffA<50){
    				dcrateA = 3;
    			}else if(dccoeffA<500){
    				dcrateA = 2;
    			}else if(dccoeffA< 5000){
    				dcrateA = 1
    			}else{
    				dcrateA = 0
    			}
    			if(dccoeffB<50){
    				dcrateB = 3;
    			}else if(dccoeffB < 500){
    				dcrateB = 2;
    			}else if(dccoeffB < 5000){
    				dcrateB = 1
    			}else{
    				dcrateB = 0
    			}
    			prodRec['DCRate_A'] = dcrateA;
    			prodRec['DCRate_B'] = dcrateB;
				var cob2;// = iterateCats(_cvdf[0], pVdef, this.state.sysSettings, prodSettings, _vmap, this.state.rec)
    			var pages;// = {}    		
					if(this.refs.sd){
						this.refs.sd.parseInfo(this.state.sysSettings, prodRec)	
					}
					if(this.refs.im){
						//console.log('parse ProdRec')
						this.refs.im.parseInfo(this.state.sysSettings, prodRec)
					}
				if(isDiff(prodRec,this.state.prodSettings)){
					//console.log('hi')
					cob2 = this.getCob(this.state.sysSettings, prodRec, this.state.rec, this.state.framRec)
					pages = this.getPages(this.state.sysSettings, prodRec, this.state.rec, this.state.framRec)
				
					this.setState({prodSettings:prodRec, cob2:cob2, pages:pages, updateCount:0,update:true})
				}
			}	
		}else if(lcd_type==2){
			if(vdefByMac[d.mac])
			{
					var pVdef = vdefByMac[d.mac][1]
					var rejOn = 0
					var shouldUpdate = false
  					var pauseGraph = false;
					var prodRec = e.rec
					var iobits = {}
					if(_ioBits){
    						
    						_ioBits.forEach(function(b){
    							if(typeof prodRec[b] != 'undefined'){
    								iobits[b] = prodRec[b]
    							}
    						})
    						if(isDiff(iobits,this.state.ioBITs)){
    							shouldUpdate = true;
    							//this.setState({ioBITs:iobits, update:true})
    						}
    					}

    					  	var faultArray = [];
				  	var warningArray = [];
					pVdef[7].forEach(function(f){
					if(prodRec[f] != 0){
						faultArray.push(f)
							if(self.state.prodSettings[f+'Warn'] == 1){
								warningArray.push(f)
							}
						}
					});
					////////console.log(rejOn)
					
  					if(this.state.faultArray.length != faultArray.length){
  						shouldUpdate = true;
  						//this.setState({faultArray:faultArray, rejOn:rejOn, update:true})
  					}else if(this.state.rejOn != rejOn){
  						shouldUpdate = true
  						////////console.log(['4566', rejOn])
  					}else if(this.state.warningArray.length != warningArray.length){
  						shouldUpdate = true;
  						//this.setState({faultArray:faultArray, rejOn:rejOn, update:true})
  					}else{
  						//var diff = false;
  						faultArray.forEach(function (f) {
  							if(self.state.faultArray.indexOf(f) == -1){
  								shouldUpdate = true;
  							}
  						})
  						warningArray.forEach(function (w) {
  							// body...
  							if(self.state.warningArray.indexOf(w) == -1){
  								shouldUpdate = true;
  							}
  						})
  					}


  					if(this.state.updateCount == 6){
  						if((this.refs.sModal.state.show && !this.refs.sModal.state.keyboardVisible) || (this.refs.snModal.state.show && !this.refs.snModal.state.keyboardVisible)
  							|| (this.refs.teModal.state.show && !this.refs.teModal.state.keyboardVisible)|| (this.refs.calibModal.state.show && this.state.showCal && !this.refs.calibModal.state.keyboardVisible)){
  								shouldUpdate = true
  						}
  					}
  						if(this.refs.sModal.state.show && this.refs.sModal.state.keyboardVisible){
  							shouldUpdate = false;
  						}	
    				if(this.state.interceptor){
    					if(this.state.rec['DateTime'] != prodRec['DateTime']){
    						this.refs.im.setDT(prodRec['DateTime'])
    					}
    					var pk;
    					var sig; 
						var pka = prodRec['Peak_A'];
						
						var pkb = prodRec['Peak_B'];
						var siga = uintToInt(prodRec['DetectSignal_A'],16)
						var sigb = uintToInt(prodRec['DetectSignal_B'],16)
						var phaseA = (uintToInt(prodRec['PhaseAngleAuto_A'],16)/100).toFixed(2)
						var phaseB = (uintToInt(prodRec['PhaseAngleAuto_B'],16)/100).toFixed(2)
						var phaseSpeedA = prodRec['PhaseFastBit_A']
						var phaseSpeedB = prodRec['PhaseFastBit_B']
						var rpka = prodRec['ProdPeakR_A']
						var xpka = prodRec['ProdPeakX_A']
						var rpkb = prodRec['ProdPeakR_B']
						var xpkb = prodRec['ProdPeakX_B']
						var sensCalA = prodRec['LearningSensBit_A']
						var sensCalB = prodRec['LearningSensBit_B']
						var rej = prodRec['RejCount']
						var det_power_a = this.state.prodSettings['OscPower_A'];
						var det_power_b = this.state.prodSettings['OscPower_B']
					
						rejOn = prodRec['LS_YEL'] || prodRec['LS_BUZ'];
						var phaseWet = prodRec['PhaseWetBit_A']

						var phaseWetB = prodRec['PhaseWetBit_B']
						var prod_a = prodRec['Prod_LED_A'];

						var pled_a = 0
						if(prodRec['Prod_HI_LED_A'] == 1){
							pled_a = 2
						}else if(prodRec['Prod_LED_A'] == 1){
							pled_a = 1
						}
						var pled_b = 0
						if(prodRec['Prod_HI_LED_B'] == 1){
							pled_b = 2
						}else if(prodRec['Prod_LED_B'] == 1){
							pled_b = 1
						}
						if(true){//vdefByMac[this.props.det.mac][0]['@defines']['INTERCEPTOR_DF']){
							pk = prodRec['Peak']
							sig =uintToInt(prodRec['DetectSignal'],16)
							this.refs.sModal.updateMeter(sig)
  							this.refs.sModal.updateSig(pk)
  							this.refs.snModal.updateMeter(sig)
  							this.refs.snModal.updateSig(pk)
  							this.refs.calibModal.updateMeter(sig)
  							this.refs.calibModal.updateSig(pk)
  							this.refs.teModal.updateMeter(sig)
  							this.refs.teModal.updateSig(pk)
  							this.refs.tModal.updateMeter(sig)
  							this.refs.tModal.updateSig(pk)
  							this.refs.loginModal.updateMeter(sig)
  							this.refs.loginModal.updateSig(pk)
  						
						}else{
							this.refs.sModal.updateMeter(siga,sigb)
  							this.refs.sModal.updateSig(pka,pkb)
  							this.refs.snModal.updateMeter(siga,sigb)
  							this.refs.snModal.updateSig(pka,pkb)
  							this.refs.calibModal.updateMeter(siga,sigb)
  							this.refs.calibModal.updateSig(pka,pkb)
  							this.refs.teModal.updateMeter(siga,sigb)
  							this.refs.teModal.updateSig(pka,pkb)
  							this.refs.tModal.updateMeter(siga,sigb)
  							this.refs.tModal.updateSig(pka,pkb)
  							this.refs.loginModal.updateMeter(siga,sigb)
  							this.refs.loginModal.updateSig(pka,pkb)
						}

							if(this.refs.dfs){
  								this.refs.dfs.setPeaks(siga,sigb,sig)
  							}
						if((this.refs.im.state.rpeak != rpka)||(this.refs.im.state.xpeak != xpka)||(this.refs.im.state.rej != rej)
							||(this.refs.im.state.phase != phaseA)||(this.refs.im.state.rpeakb != rpkb)||(this.refs.im.state.xpeakb != xpkb)
							||(this.refs.im.state.phaseb != phaseB)||(this.refs.im.state.phaseFast != phaseSpeedA)||(this.refs.im.state.phaseFastB != phaseSpeedB)||(this.refs.im.state.pled_a !=pled_a)||(this.refs.im.state.pled_b !=pled_b)){
							this.refs.im.setState({rpeak:rpka,rpeakb:rpkb,xpeak:xpka,xpeakb:xpkb,rej:rej,phase:phaseA,phaseb:phaseB,phaseFast:phaseSpeedA,phaseFastB:phaseSpeedB, pled_a:pled_a, pled_b:pled_b})		
						}
						if(this.refs.cb){
							if((this.refs.cb.state.sensCalA != sensCalA)||(this.refs.cb.state.sensCalB != sensCalB)||(this.refs.cb.state.sensA != this.state.prodSettings['Sens_A'])||(this.refs.cb.state.sensB != this.state.prodSettings['Sens_B'])||(this.refs.cb.state.rpeak != rpka)||(this.refs.cb.state.xpeak != xpka)||(this.refs.cb.state.phase != phaseA)||(this.refs.cb.state.rpeakb != rpkb)||(this.refs.cb.state.xpeakb != xpkb)|| (this.refs.cb.state.det_power_b != det_power_b) || (this.refs.cb.state.det_power_a != det_power_a) 
							||(this.refs.cb.state.phaseb != phaseB)||(this.refs.cb.state.phaseSpeed != phaseSpeedA)||(this.refs.cb.state.phaseSpeedB != phaseSpeedB)||(this.refs.cb.state.phaseMode != phaseWet) || (this.refs.cb.state.phaseModeB != phaseWetB)){//||(this.refs.cb.state.pled_a != pled_a)||(this.refs.cb.state.pled_b != pled_b)){
								this.refs.cb.setState({sensA:this.state.prodSettings['Sens_A'],sensB:this.state.prodSettings['Sens_B'],rpeak:rpka, xpeak:xpka,sensCalA:sensCalA,sensCalB:sensCalB, phase:phaseA, rpeakb:rpkb, xpeakb:xpkb, phaseb:phaseB,phaseSpeed:phaseSpeedA,phaseSpeedB:phaseSpeedB,phaseMode:phaseWet, phaseModeB:phaseWetB, det_power_a:det_power_a, det_power_b:det_power_b})
							}

							this.refs.cb.setPleds(pled_a, pled_b)
						}

						this.refs.im.update(siga,sigb,sig)
						this.refs.im.updatePeak(pka,pkb,pk)
  						pka = null;
  						pkb = null;
  						siga = null;
  						sigb = null;
  						phaseA = null;
  						phaseB = null;
  						phaseSpeedA = null;
  						phaseSpeedB = null;
  						rpka = null;
  						xpkb = null;
  						rej = null;

					}else{
						var peak = prodRec['Peak']
						var rej = prodRec['RejCount']
						var sig = uintToInt(prodRec['DetectSignal'],16)
						var phase = (uintToInt(prodRec['PhaseAngleAuto'],16)/100).toFixed(2)
						var phaseSpeed = prodRec['PhaseFastBit'];
						var rpeak = prodRec['ProdPeakR']
						var xpeak = prodRec['ProdPeakX']
						rejOn = prodRec['LS_YEL'] || prodRec['LS_BUZ']

						if((this.refs.im.state.peak !=peak)||(this.refs.im.state.rpeak != rpeak)||(this.refs.im.state.xpeak != xpeak)||(this.refs.im.state.rej != rej)
							||(this.refs.im.state.phase != phase)||(this.refs.im.state.phaseFast != phaseSpeed)){
							this.refs.im.setState({peak:peak,rpeak:rpeak,xpeak:xpeak,rej:rej,phase:phase,phaseFast:phaseSpeed})		
						}
						if(this.refs.cb){
							if((this.refs.cb.state.rpeak != rpeak)||(this.refs.cb.state.xpeak != xpeak)||(this.refs.cb.state.phase != phase)||(this.refs.cb.state.phaseSpeed != phaseSpeed)){
								this.refs.cb.setState({rpeak:rpeak, xpeak:xpeak, phase:phase, phaseSpeed:phaseSpeed})
							}
						}
						this.refs.im.update(sig)
						peak = null;
						sig = null;
						phase = null;
						phaseSpeed = null;
						rpeak = null;
						xpeak = null;

		
					}
					
  					var siga = uintToInt(prodRec['DetectSignal_A'],16)
  					var sigb = uintToInt(prodRec['DetectSignal_B'],16)
  					var trec = 0;	

  					if(this.state.testRec['TestRecOnFlag']){
						trec = 1
						if(this.state.testRec['TestRecPage'] == 3){
						trec = 2
						}
						if(this.state.testRec['TestRecPage'] == 2){
						trec = 2
						}
					}
  					if(this.props.kraft){
  						if(this.state.rec['CIP_PLC'] != prodRec['CIP_PLC']){
  							this.refs.im.cip_plc(prodRec['CIP_PLC'])
  						}
  						if(this.state.rec['IsoCleanTimeoutSec'] != prodRec['IsoCleanTimeoutSec']){
  							this.refs.im.cip_test(prodRec['IsoCleanTimeoutSec'])
  						}
  						if(prodRec['CIP_PLC'] || (prodRec['IsoCleanTimeoutSec'])){
  							trec = 0;
  						}
  					}else{
  						if(this.state.rec['CIP'] != prodRec['CIP']){
  							this.refs.im.cip_plc(prodRec['CIP'])
  						}
  						if(prodRec['CIP']){
  							trec = 0;
  						}
  					}
  					
  					if(this.state.trec != trec){
  						shouldUpdate = true;
  					}

  						if(shouldUpdate){
  							if(this.refs.sModal.state.show){
  								var	cob2 = this.getCob(this.state.sysSettings, this.state.prodSettings, prodRec, this.state.framRec)
  								this.setState({rec:prodRec,faultArray:faultArray,warningArray:warningArray,trec:trec, cob2:cob2, rejOn:rejOn, updateCount:0,update:shouldUpdate, ioBITs:iobits})
  								////////console.log(['3196',cob2])
  								
  								cob2 = null;
  							}else if(this.refs.snModal.state.show){
  								var	sns = this.getPage('Sens',this.state.sysSettings,this.state.prodSettings, prodRec, this.state.framRec)
  								var pages = this.state.pages;
  								pages['Sens'] = sns
  								this.setState({rec:prodRec, pages:pages,faultArray:faultArray,warningArray:warningArray,trec:trec, rejOn:rejOn,updateCount:0,update:shouldUpdate, ioBITs:iobits})
  								sns = null;
  								pages = null;

  							}else if(this.refs.teModal.state.show){
  								var	te = this.getPage('Test',this.state.sysSettings,this.state.prodSettings, prodRec, this.state.framRec)
  								var pages = this.state.pages;
  								pages['Test'] = te
  								this.setState({rec:prodRec, pages:pages,faultArray:faultArray,warningArray:warningArray,trec:trec,rejOn:rejOn, updateCount:0,update:shouldUpdate, ioBITs:iobits})
  								te = null;
  								pages = null;
  							}else if(this.state.showCal){
  								////////console.log(['3878',prodRec['PhaseAngleAuto_B']])
  								var	cal = this.getPage('Calibration',this.state.sysSettings,this.state.prodSettings, prodRec, this.state.framRec)
  								var pages = this.state.pages;
  								pages['Calibration'] = cal
  								this.setState({rec:prodRec, pages:pages,faultArray:faultArray,warningArray:warningArray,trec:trec, rejOn:rejOn, updateCount:0,update:shouldUpdate, ioBITs:iobits})
  								cal = null;
  								pages = null;
  							}else{
  								this.setState({rec:prodRec,faultArray:faultArray,warningArray:warningArray, rejOn:rejOn,trec:trec, updateCount:0, update:shouldUpdate, ioBITs:iobits})
  							}
  						}else{
  							this.state.rec = prodRec,
  							this.state.ioBITs = iobits
  							this.state.updateCount = (this.state.updateCount+1)%7
  						}
  						faultArray = null;
  						warningArray = null;
			}
			
			pVdef = null;
			iobits = null;

   		}else if(lcd_type == 3){
   					
			var framRec = e.rec
			framRec['Nif_ip'] = this.props.nifip //this.props.nif.ip
			framRec['Nif_nm'] = this.props.nifnm
			framRec['Nif_gw'] = this.props.nifgw
			//framRec['Nif_nm'] = this.props.nif.nm
			if(isDiff(framRec, this.state.framRec)){
				var cob2 = this.getCob(this.state.sysSettings, this.state.prodSettings, this.state.rec, framRec)
				
				this.setState({framRec:framRec,cob2:cob2, update:true})
				//console.log(framRec)
			}
			//console.log(framRec)
			framRec = null;

		}else if(lcd_type == 4){
   				var testRec = e.rec
				var trec = 0;
				if(testRec['TestRecOnFlag']){
					trec = 1
					if(testRec['TestRecPage'] == 3){
						trec = 2
					}
					if(testRec['TestRecPage'] == 2){
						trec = 2
					}
				}
				if(this.props.kraft){
					if((this.state.rec['CIP_PLC']) || this.state.rec['IsoCleanTimeoutSec'] != 0){
						trec = 0;
					}
				}else{
					if(this.state.rec['CIP']){
						trec = 0;
					}
				}
    			if(isDiff(testRec, this.state.testRec) || this.state.trec != trec){
    				this.setState({testRec:testRec, trec:trec, update:true})
    			}
    		
		
    			testRec = null;

   		}

   		prodRec = null;	
   		faultArray = null;	
   		e = null;
   		d = null;
   		combinedSettings = null;
   		cob2 = null;	
	}
	shouldComponentUpdate (nextProps, nextState) {
		if(nextState.update !== false){
			return true;
		}else{
			return false
		}
	}
	setLEDS(det_a,prod_a,prodhi_a){
			var pled_a = 0
		if(prodhi_a == 1){
			pled_a = 2
		}else if(prod_a == 1){
			pled_a = 1
		}
		this.refs.lv.setLEDs(pled_a,det_a)
	
	}
	setLEDSInt(det_a,prod_a,prodhi_a,det_b,prod_b,prodhi_b){
		var pled_a = 0
		if(prodhi_a == 1){
			pled_a = 2
		}else if(prod_a == 1){
			pled_a = 1
		}
		var pled_b = 0
		if(prodhi_b == 1){
			pled_b = 2
		}else if(prod_b == 1){
			pled_b = 1
		}
		this.refs.lv.setLEDs(pled_a,det_a,pled_b,det_b)
	}
	showSettings () {
		var self = this;
		// accessControl
		if((vdefByMac[this.props.det.mac][4][0].acc <= this.state.level)||(this.state.level > 2)||(this.state.sysSettings['PassOn'] == 0)){

		
		this.setState({data:[[this.state.cob2,0]], update:true})
		setTimeout(function () {
				self.refs.im.pauseGraph();
				self.refs.sModal.toggle();
		}, 100)
		}else{
			//toast('Access Denied')
			setTimeout(function () {
				self.toggleLogin();
		}, 100)
		}
	}
	showSens () {
			var self = this;
		
		// accessControl
		if((this.state.sysSettings['PassAccSens'] <= this.state.level)||(this.state.sysSettings['PassOn'] == 0)||(this.state.level > 2)){

			this.setState({data:[[this.state.pages['Sens'],0]], stack:[], update:true})

			setTimeout(function () {
			// body...
				self.refs.im.pauseGraph();
				self.refs.snModal.toggle()
			}, 100)
		}else{
			//toast('Access Denied')
				setTimeout(function () {
				self.toggleLogin();
		}, 100)
		}
	}
	showTestModal () {
		var self = this;
		// accessControl
		if((this.state.sysSettings['PassAccTest'] <= this.state.level)||(this.state.sysSettings['PassOn'] == 0)||(this.state.level > 2)){

		
		if(this.state.settings){
			var st = [];
			var currentView = 'MainDisplay';
			this.setState({currentView:currentView, stack:[], data:[], settings:false,showTest:false, update:true});
		}
		else{
			this.setState({settings:true,showTest:false, stack:[], data:[], update:true});
			var SettingArray = ['SettingsDisplay',[]]
			this.changeView(SettingArray);
		}
		setTimeout(function () {
			// body...
				self.refs.im.pauseGraph();		
				self.refs.teModal.toggle()
		}, 100)
		}else{
			//toast('Access Denied')
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}
	
	}
	showTestRModal () {
		var self = this;
		// accessControl
			if((this.state.sysSettings['PassAccTest'] <= this.state.level)||(this.state.sysSettings['PassOn'] == 0)||(this.state.level > 2)){

		
		if(this.state.settings){
			var st = [];
			var currentView = 'MainDisplay';
			this.setState({currentView:currentView, stack:[], data:[], settings:false,showTest:false, update:true});
		}
		else{
			this.setState({settings:true,showTest:false, stack:[], data:[], update:true});
			var SettingArray = ['SettingsDisplay',[]]
			this.changeView(SettingArray);
		}
		setTimeout(function () {
			// body...

			self.refs.tModal.toggle()
		}, 100)
		}else{
			//toast('Access Denied')
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}

	}
	showCalibModal () {
		var self = this;
	
		// accessControl
		if((this.state.sysSettings['PassAccCal'] <= this.state.level)||(this.state.sysSettings['PassOn'] == 0)||(this.state.level > 2)){
			this.setState({showCal:false, update:true})
			setTimeout(function (argument) {
				self.refs.im.pauseGraph();
				self.refs.calibModal.toggle();
			
			},100)
		}else{
			//toast('Access Denied')
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}

	}
	toggleTestSettings () {
		var self = this;
	
		// accessControl
		if((vdefByMac[this.props.det.mac][6]['Test'].acc <= this.state.level)||(this.state.level > 2)||(this.state.sysSettings['PassOn'] == 0)){

			if(this.state.showTest){
				this.setState({showTest:false, data:[], stack:[], update:true})
			}else{
				this.setState({showTest:true, data:[[this.state.pages['Test'],0]], stack:[], update:true})
			}
		}else{
			//toast("Access Denied")
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}
	}
	toggleCalSettings () {
		var self = this;
	
		// accessControl
		if((this.state.level > 3)||(this.state.sysSettings['PassOn'] == 0)){

			if(this.state.showCal){
				this.setState({showCal:false, data:[], stack:[], update:true})
			}else{
				this.setState({showCal:true, data:[[this.state.pages['Calibration'],0]], stack:[], update:true})
			}
		}else{
			//toast("Access Denied")
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}

	}
	toggleSensSettings () {
		// accessControl
		var self = this;
		if((this.state.level > 3)||(this.state.sysSettings['PassOn'] == 0)){

			if(this.state.showSens){
				this.setState({showSens:false, data:[], stack:[], update:true})
			}else{
				this.setState({showSens:true, data:[[this.state.pages['Sens'],0]], stack:[], update:true})
			}
		}else{
			//toast("Access Denied")
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}
	}
	logoClick () {
		this.props.logoClick();
	}
	goBack () {
		if(this.state.stack.length > 0){
			var stack = this.state.stack;
			var d = stack.pop();
			setTimeout(this.setState({currentView:d[0], data: d[1], stack: stack, settings:(d[0] == 'SettingsDisplay'), update:true }),100);
			
		}
	}
	changeView (d) {
		var st = this.state.stack;
		st.push([this.state.currentView, this.state.data]);
		this.setState({currentView:d[0], data:d[1], update:true})
	}
	settingClick (s,n) {
		var set = this.state.data.slice(0)
		if(Array.isArray(s)){
			set.push(s)
		}else{
			set.push(s)
			set.push(n)
		}
		var self = this;
		setTimeout(function () {
			self.changeView(['SettingsDisplay',set]);
		},100)
		
	}
	clear (param) {
		//////console.log(['3277',param])
		var packet = dsp_rpc_paylod_for(param['@rpcs']['clear'][0],param['@rpcs']['clear'][1],param['@rpcs']['clear'][2] ) 
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		packet = null;
	}	
	sendPacket (n,v) {
		var vdef = vdefByMac[this.props.mac]
		var self = this;
		if(typeof n == 'string'){
			if(n == 'KAPI_REJ_MODE_CLEARLATCH'){
			var rpc = vdef[0]['@rpc_map']['KAPI_REJ_MODE_CLEARLATCH']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			}else if(n == 'copyCurrentProd'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_COPY_NO_WRITE']
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		
			}else if(n=='DateTime'){
				var rpc = vdef[0]['@rpc_map']['LOCF_DATE_TIME_WRITE']
	
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],v);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
			}else if(n=='deleteProd'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_DEL_NO_WRITE']
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
			}else if(n=='DaylightSavings'){
				var rpc = vdef[0]['@rpc_map']['KAPI_DAYLIGHT_SAVINGS_WRITE']
	
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
			}else if(n=='deleteProd'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_DEL_NO_WRITE']
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
			}else if(n== 'Sens_A'){
			var rpc = vdef[0]['@rpc_map']['KAPI_SENS_WRITE']
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[1]);
			//////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			}else if(n == 'Sens'){
			var rpc = vdef[0]['@rpc_map']['KAPI_SENS_WRITE']
			var pkt = rpc[1].map(function (r) {
				// body...
					if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}
			})
			//////////console.log(this.props.ip)
			var packet = dsp_rpc_paylod_for(rpc[0],pkt);
			//////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
		}else if(n == 'Sens_B'){
			//////////console.log(this.props.ip)
			var rpc = vdef[0]['@rpc_map']['KAPI_SENS_WRITE']
			var pkt = rpc[1].map(function (r) {
				// body...
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}			
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[0]);
			//////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
		}else if(n == 'SigModeCombined'){
			//////////console.log(this.props.ip)
			var rpc = vdef[0]['@rpc_map']['KAPI_SIG_MODE_COMBINED_WRITE']
			var pkt = rpc[1].map(function (r) {
				// body...
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}			
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[0]);
			//////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
		}else if(n == 'oscPower'){
			var rpc = vdef[0]['@rpc_map']['KAPI_OSC_POWER_WRITE']
			var pkt = rpc[1].map(function (r) {
				// body...
					if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}
			})
			//////////console.log(this.props.ip)
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[1]);
			//////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
		}else if(n == 'oscPowerB'){
			//////////console.log(this.props.ip)
			var rpc = vdef[0]['@rpc_map']['KAPI_OSC_POWER_WRITE']
			var pkt = rpc[1].map(function (r) {
				// body...
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}			
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[0]);
			//////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
		}else if(n == 'ProdNo'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_NO_APIWRITE']
			var pkt = rpc[1].map(function (r) {
				// body...
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt);
					//////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		}else if(n == 'ProdName'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_NAME_APIWRITE']
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}
			})
			var str = (v + "                    ").slice(0,20)
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,str);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		
		}else if(n == 'cal'){
			var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CALIBRATE']
			
			var packet = dsp_rpc_paylod_for(rpc[0], [rpc[1][0],1],v)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		}else if(n == 'getProdList'){
			this.setState({pind:0})
			var self = this;
			setTimeout(function () {
				// body...
				var rpc = vdef[0]['@rpc_map']['KAPI_PROD_DEF_FLAGS_READ']
				var pkt = rpc[1].map(function (r) {
				// body...
					if(!isNaN(r)){
						return r
					}else{
						return 0	
				}
				})
				var packet = dsp_rpc_paylod_for(rpc[0], pkt)
				socket.emit('rpc', {ip:self.props.ip, data:packet})
			},100)
			
		}else if(n =='getProdName'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_NAME_APIREAD']
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0], pkt)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		}else if(n=='refresh'){
			var rpc = vdef[0]['@rpc_map']['KAPI_RPC_SENDWEBPARAMETERS']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})	
		}else if(n=='rpeak'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_PEAK_R_CLEAR'];
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],[1])
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		}else if(n=='xpeak'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_PEAK_R_CLEAR'];
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],[1])
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		
		}else if(n=='rpeakb'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_PEAK_R_CLEAR'];
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		}else if(n=='xpeakb'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_PEAK_R_CLEAR'];
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],[0]);			
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		}else if(n=='phaseEdit'){
			var phase = Math.round(parseFloat(v)*100)
			var rpc = vdef[0]['@rpc_map']['KAPI_PHASE_ANGLE_WRITE']
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(phase)){
						return 0
					}else{
						return parseInt(phase)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt)
			if(this.props.det.interceptor){
				packet = dsp_rpc_paylod_for(rpc[0],pkt,[1])
			}
			
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		
		}else if(n=='phaseEditb'){
			var phase = Math.round(parseFloat(v)*100)
			var rpc = vdef[0]['@rpc_map']['KAPI_PHASE_ANGLE_WRITE']
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(phase)){
						return 0
					}else{
						return parseInt(phase)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[0])
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		
		}else if(n=='phaseMode'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PHASE_MODE_WRITE']
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt)
			if(this.props.det.interceptor){
				packet = dsp_rpc_paylod_for(rpc[0],pkt,[1])
			}
			
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		
		}else if(n=='phaseModeb'){
			//var phase = Math.round(parseFloat(v)*100)
			var rpc = vdef[0]['@rpc_map']['KAPI_PHASE_MODE_WRITE']
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(v)){
						return 0
					}else{
						return parseInt(v)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[0])
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		
		}else if(n=='test'){
			var packet = dsp_rpc_paylod_for(19,[32,v,0]);
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})	
		}else if(n=='clearFaults'){
			var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CLEARFAULTS']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})	

		}else if(n=='clearWarnings'){
			//console.log(vdef[0]['@rpc_map'])
			var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CLEARWARNINGS']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})	

		}else if(n=='DefaultRestore'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_DEFAULT_RESTORE']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})
		}else if(n=='DeleteAll'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_DEFAULT_DELETEALL']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})
		}else if(n=='FactorySave'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_FACTORY_SAVE']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})
		}else if(n=='FactoryRestore'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_FACTORY_RESTORE']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})
		}
		}else{
		if(n['@rpcs']['toggle']){

			var arg1 = n['@rpcs']['toggle'][0];
			var arg2 = [];
			for(var i = 0; i<n['@rpcs']['toggle'][1].length;i++){
				if(!isNaN(n['@rpcs']['toggle'][1][i])){
					arg2.push(n['@rpcs']['toggle'][1][i])
				}else{
					arg2.push(parseInt(v))
				}
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		}else if(n['@rpcs']['write']){
			var arg1 = n['@rpcs']['write'][0];
			var arg2 = [];
			var strArg = null;
			for(var i = 0; i<n['@rpcs']['write'][1].length;i++){
				if(!isNaN(n['@rpcs']['write'][1][i])){
					arg2.push(n['@rpcs']['write'][1][i])
				}else if(n['@rpcs']['write'][1][i] == n['@name']){
					if(!isNaN(v)){
						arg2.push(v)
					}
					else{
						arg2.push(0)
						strArg=v
					}
				}else{
					var dep = n['@rpcs']['write'][1][i]
					if(dep.charAt(0) == '%'){

					}
				}
			}
			if(n['@rpcs']['write'][2]){
				if(Array.isArray(n['@rpcs']['write'][2])){
					strArg = n['@rpcs']['write'][2]
				}
				else if(typeof n['@rpcs']['write'][2] == 'string'){
					strArg = v
				}
			}
			////console.log(['5582', strArg])
			
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		
		
		}else if(n['@rpcs']['clear']){
			var packet;
			this.clear(n)
		}else if(n['@rpcs']['start']){
			var rpc = n['@rpcs']['start']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})	
		}
		}
			packet = null;
	}


	settingsClosed () {
		// body...
			var st = [];
			var currentView = 'MainDisplay';
			this.refs.im.restart();
			this.setState({currentView:currentView,data:[], stack:[], settings:false, update:true})

	}
	onCalFocus () {
		// body...
		this.refs.calibModal.setState({override:true})
	}
	onCalClose () {
		// body...
		var self = this;
		setTimeout(function () {
			// body...
				self.refs.calibModal.setState({override:false})
		},100)
	
	}
	clearSig (a) {
		// body...

		var param = this.state.pVdef[2][a]
		this.clear(param) 
		/*var packet= dsp_rpc_paylod_for(19,[36,0,0],[a])
		if(a == 2){
			packet= dsp_rpc_paylod_for(19,[36,0,0])
		}
		socket.emit('rpc', {ip:this.props.ip, data:packet})*/
		
	}
	_renderTest () {
		// body...
		var testModes = ['Manual','Halo','Manual 2', 'Halo 2']
		var activeModes = [];
		for(var i = 0; i<4; i++){
			if(this.state.prodSettings['TestConfigCount'+i+'_0'] > 0){
				activeModes.push(i)
			}
		}
		if(activeModes.length == 0){
			return <div>No Tests Configured</div>
		}
	}
	sendOp (e) {
		// body...
		var num = 0
		if(typeof e == 'number'){
			num = parseInt(e)
		}
		var rpc = vdefByMac[this.props.mac][0]['@rpc_map']['LOCF_IBOPER_CODE_WRITE']
		var pkt = rpc[1].map(function (v) {
			// body...
			if(isNaN(v)){
				return e;
			}else{
				return v;
			}
		})
		var packet = dsp_rpc_paylod_for(rpc[0],pkt)
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		
	}
	sendAck(){
		var rpc = vdefByMac[this.props.mac][0]['@rpc_map']['KAPI_TEST_METAL_TYPE_OK']
		
		var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
	}
	onFocus(){

	}
	onRequestClose(){

	}
	quitTest () {
		// body...
		var rpc = vdefByMac[this.props.mac][0]['@rpc_map']['LOCF_IBTEST_PASS_QUIT']
		var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		
	}
	getTestText(){
		var testModes = ['Manual','Halo','Manual 2', 'Halo 2']
		var metTypes = ['Ferrous','Non-Ferrous','Stainless Steel']
		var schain = ['B','A']
		var cn = this.state.testRec['TestRecConfig']
		var mode = testModes[this.state.testRec['TestRecConfig']]
		var testcount = 3
		var cfs = []
		if(this.props.det.interceptor){
			testcount = 6
		}
		if(this.state.testRec['TestRecPage'] == 3){
			return "Enter Operator Number"
		}
		if(this.state.testRec['TestRecPage'] == 2){
			return "Select Test to run"
		}
		if((this.state.testRec['TestRecAckMetalFlag'])&&(this.state.testRec['TestRecPassCnt'] == 0)){
			return "Acknowledge required"
		}else{
			var i = this.state.testRec['TestRecOrder']
			var cnt = this.state.prodSettings['TestConfigCount'+cn+'_'+i]
			var cntString = cnt - this.state.testRec['TestRecPassCnt'] + ' of '+ cnt
			var met = metTypes[this.state.prodSettings['TestConfigMetal'+cn+'_'+i]]
			return cntString + ' Metal Type:' + met
		}
			
	}
	renderTest () {
		// body...
		var testcont = ''
		var ack = ''
		var nograd = {background:'rgba(128, 128, 128, 0.3)', fontSize:25, width:170	}

		var tdstyle = {background:'linear-gradient(135deg, rgba(128, 128, 128, 0.3), transparent 67%)'	}

		var tdstyleintA = { background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))'}
		var testModes = ['Manual','Halo','Manual 2', 'Halo 2']
		var _tcats = ['Manual','Halo','Manual2','Halo2']
		var metTypes = ['Ferrous','Non-Ferrous','Stainless Steel']
		var schain = ['B','A']
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']
		var lg = lgs[this.state.language]
		
		if(this.state.testRec['TestRecOnFlag']){
			if(this.state.testRec['TestRecPage'] == 3){
				//send operator code
				testcont = <div>Test required. Enter operator code
						<div><button onClick={()=> this.refs.op.toggle()}>Enter</button></div>
						 <CustomKeyboard  language={lg} pwd={false} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='op' onChange={this.sendOp} value={''} label={'Operator Code'}/>
	

					</div>

			}else if(this.state.testRec['TestRecPage'] == 2){
				//prompt
					testcont = <TestReq mobile={!this.state.br} ip={this.props.ip} toggle={this.showTestRModal} settings={this.state.prodSettings}/>  

			}else{
				var cn = this.state.testRec['TestRecConfig']
				var mode = testModes[this.state.testRec['TestRecConfig']]
				var testcount = 3
				var cfs = []
				if(this.props.det.interceptor){
					//testcount = 6
				}
				for(var i = 0; i<testcount;i++){
					var cnt = this.state.prodSettings['TestConfigCount'+cn+'_'+i]//config[i]['@children'][1];
					var met = metTypes[this.state.prodSettings['TestConfigMetal'+cn+'_'+i]]
					var sigchain = ''

					if(this.props.det.interceptor){
						//sigchain = <div style={{display:'inline-block', width:50}}>{schain[this.state.prodSettings['TestConfigFreq'+cn+'_'+i]]}</div>
					}
					var lab = ''
					if(i == this.state.testRec['TestRecOrder']){

						if((this.state.testRec['TestRecAckMetalFlag'])&&(this.state.testRec['TestRecPassCnt'] == 0))
						{
							ack = <button onClick={this.sendAck}>Acknowledge Test</button>
						}else{
							ack = 'Currently Running'
						}
						lab = <div style={{background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))',fontSize:25}}><div style={{display:'inline-block', width:100}}>{cnt - this.state.testRec['TestRecPassCnt']} of {cnt}
						</div><div style={{display:'inline-block', width:200}}>{met}</div>{sigchain}<div style={{display:'inline-block', width:300}}>{ack}</div></div>
					}else if(i<this.state.testRec['TestRecOrder']){
						lab = <div style={{background:'linear-gradient(315deg, transparent 33%, rgba(0,128,128,0.4))',fontSize:25}}><div style={{display:'inline-block', width:100}}>{cnt} of {cnt}
						</div><div style={{display:'inline-block', width:200}}>{met}</div>{sigchain}<div style={{display:'inline-block', width:300}}>Done</div></div>
					
					}else if(cnt != 0){
						lab = <div style={{background:'linear-gradient(315deg, transparent 33%, rgba(128,128,128,0.4))',fontSize:25}}><div style={{display:'inline-block', width:100}}>0 of {cnt}
						</div><div style={{display:'inline-block', width:200}}>{met}</div>{sigchain}<div style={{display:'inline-block', width:300}}></div></div>
					
					}
					cfs.push(lab)
				}
				testcont = <div>
					<div>Test - {mode}</div>
					<div><div>
					{cfs}
					</div></div>
				</div>

				
			}
		}

		var testprompt = (<div style={{color:'#e1e1e1'}}>{testcont}<div><button onClick={this.quitTest}>Quit Test</button></div></div>)
		return testprompt
	}
	setOverride (ov) {
		this.refs.sModal.setState({keyboardVisible:ov})
	}
	setTOverride (ov) {
		this.refs.teModal.setState({keyboardVisible:ov})
	}
	setCOverride (ov) {
		this.refs.calibModal.setState({keyboardVisible:ov})
	}
	setSOverride (ov) {
		this.refs.snModal.setState({keyboardVisible:ov})
	}
	
	getProdName (n, cb,i) {
		var self = this;
		this.setState({callback:cb, pind:i})
		setTimeout(function () {
			self.sendPacket('getProdName',n)
		},50)
	}
	clearFaults () {
		// accessControl
		var self = this;
		if((this.state.sysSettings['PassAccCal'] <= this.state.level)||(this.state.sysSettings['PassOn'] == 0)||(this.state.level > 2)){
			this.sendPacket('clearFaults',0)
		}else{
			//toast('Access Denied')
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}
	}
		clearWarnings () {
		// accessControl
		var self = this;
		if((this.state.sysSettings['PassAccCal'] <= this.state.level)||(this.state.sysSettings['PassOn'] == 0)||(this.state.level > 2)){
			this.sendPacket('clearWarnings',0)
		}else{
			//toast('Access Denied')
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}
	}
	calClosed () {
		this.refs.im.restart();
		this.setState({showCal:false, update:true})
	}
	snmClosed () {
		this.refs.im.restart();
		this.setState({showSens:false, update:true})
	}
	tmClosed () {
		this.refs.im.restart();
		this.setState({showTest:false, update:true})
	}
	
	calB () {
		this.sendPacket('cal',[0])
	}
	calA () {
		this.sendPacket('cal',[1])
	}
	cal () {
		this.sendPacket('cal')
	}
	onSens(s,c){
		this.sendPacket(c,s)
	}
	setLanguage (i) {
		var langs = ['english', 'korean']
		this.setState({language:i, update:true})
	} 
	toggleLogin(){
		//this.refs.loginModal.toggle()
		this.refs.lgctrl.login();
		this.setState({loginOpen:true})
	}
	login(v){
		//console.log(7077, 'login')
		this.setState({level:v,update:true})
	}
	loginClosed(){
		 //console.log(7077, 'loginClosed')
		this.setState({loginOpen:false, update:true})
	}
	authenticate(user,pswd){
		//console.log(6457, [user,pswd])
		
			
		socket.emit('authenticate',{user:parseInt(user) - 1,pswd:pswd, ip:this.props.det.ip})
		
		
	}
	render () {
		var attention = 'attention'
		if(this.state.faultArray.length != 0){
			attention = 'attention_clear'
		}
		var config = 'config'
		if(this.state.settings){
			config = 'config_active'
		}
		var find = 'find'
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']
		var lg = lgs[this.state.language]

		if(lg == 'turkish'){
		//	lg = 'korean'
		}
		if(vdefMapV2['@languages'].indexOf(lg) == -1){
			lg = 'english'
			//default to english
		}
		var df = false;

	//	//////console.log(lg)
		var MD ="";
		var dm = "";// <DetMainInfo clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} ref='dm' int={this.state.interceptor}/>
		var dg = "";// <DummyGraph ref='dg' canvasId={'dummyCanvas'} int={this.state.interceptor}/>
		var ce =""// <ConcreteElem h={400} w={400} concreteId={'concreteCanvas'} int={this.state.interceptor}/>
	 	var lstyle = {height: 72,marginRight: 20, marginLeft:10}
	 	var np = (<NetPollView language={lg} ref='np' eventCount={15} events={this.state.netpoll}/>)
		if(!this.state.minW){
			lstyle = { height: 60, marginRight: 15, marginLeft: 10}
		}
		var SD = (<SettingsDisplay2 mobile={!this.state.br} Id={this.props.ip+'SD'} language={lg} mode={'config'} setOverride={this.setOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'sd' data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} mac={this.props.det.mac} int={this.state.interceptor} cob2={[this.state.cob2]} cvdf={vdefByMac[this.props.det.mac][4]} sendPacket={this.sendPacket} prodSettings={this.state.prodSettings} sysSettings={this.state.sysSettings} dynSettings={this.state.rec} framRec={this.state.framRec} level={this.state.level}/>)
		MD = ""; 
		var mpui = 	<StealthMainPageUI usb={this.state.usb} mac={this.props.det.mac}  language={this.state.language} setLang={this.setLanguage} toggleCalib={this.showCalibModal} toggleTestModal={this.showTestModal} toggleSens={this.showSens} toggleConfig={this.showSettings} netpoll={this.state.netpoll} clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} gohome={this.logoClick} ref='im' getProdName={this.getProdName}/>
		var cb = <StealthCalibrateUI  mac={this.props.det.mac} language={lg} ref='cb' onFocus={this.onCalFocus} onRequestClose={this.onCalClose} sendPacket={this.sendPacket} refresh={this.refresh} calib={this.cal} />
	
		var lbut = (<td onClick={this.logoClick}><img style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>)
		var abut = (<td className="buttCell"><button onClick={this.toggleAttention} className={attention}/></td>)
		var cbut = (<td className="buttCell"><button onClick={this.showSettings} className={config}/></td>)
		var lmtable = (<table className='landingMenuTable'>
						<tbody>
							<tr>
								{lbut}
								<td className='mobCell'><MobLiveBar ref='lv' int={this.state.interceptor}/></td>
								{abut}
								{cbut}
						</tr>
						</tbody>
					</table>)
		if(!this.state.br){
			lmtable = (<div><table className='landingMenuTable'>
						<tbody>
							<tr>
								{lbut}
								{abut}
								{cbut}
						</tr>
						</tbody>
					</table>
					<MobLiveBar ref='lv' int={this.state.interceptor}/>
					</div>)
			if(!this.state.settings){
				MD = (<div><div className='prefInterface'>{dm}</div>
					<div className='prefInterface'>{dg} </div>
					<div className='prefInterface'>{np}</div>
					<div>{ce}</div>
					</div>)
			}	
		}
		//var ov = 0
		var status = ''
		var trec = this.state.trec;
		var tescont = <TestReq mobile={!this.state.br} ip={this.props.ip} toggle={this.showTestModal} settings={this.state.prodSettings}/>
		//var showPropmt = "Settings";
		var showPrompt = "#e1e1e1";
		var showPrompts = "#e1e1e1";
		
		var showPropmt = "#e1e1e1";
		var tbklass = 'expandButton';
		var sensui = <InterceptorSensitivityUI mobile={!this.state.br} mac={this.props.det.mac} language={lg} sensA={this.state.prodSettings['Sens_A']} sensB={this.state.prodSettings['Sens_B']} onFocus={this.onSensFocus} onRequestClose={this.onSensClose} sendPacket={this.sendPacket} refresh={this.refresh} onSens={this.onSens}/>
		if(true || vdefByMac[this.props.det.mac][0]['@defines']['INTERCEPTOR_DF']){
			df = true;
			sensui =  <InterceptorDFSensitivityUI mobile={!this.state.br} ref='dfs'  mac={this.props.det.mac} language={lg} level={this.state.level} sigmode={this.state.prodSettings['SigModeCombined']} onSigMode={this.sendPacket} sens={this.state.prodSettings['Sens']} sensA={this.state.prodSettings['Sens_A']} sensB={this.state.prodSettings['Sens_B']} onFocus={this.onSensFocus} onRequestClose={this.onSensClose} sendPacket={this.sendPacket} refresh={this.refresh} onSens={this.onSens}/>
		
		}

		var sn = (<div>
				<div style={{paddingTop:10, paddingBottom:4}}>
					 <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5, fontWeight:500, color:"#eee"}} >
					 <div style={{display:'inline-block', textAlign:'center'}}>{vdefMapV2['@labels']['Sensitivity'][lg]['name']}</div></h2></span>
					 </div>{sensui}</div>)
		if (this.state.showTest){
			var dt;
			if(this.state.data.length == 0){
				dt = []
			}
			tescont = 	<SettingsDisplay2 mobile={!this.state.br} mac={this.props.det.mac} Id={this.props.ip+'TESTD'} language={lg} setOverride={this.setTOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'testpage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} 
					cob2={[this.state.pages['Test']]} cvdf={vdefByMac[this.props.det.mac][6]['Test']} sendPacket={this.sendPacket} prodSettings={this.state.prodSettings} sysSettings={this.state.sysSettings} dynSettings={this.state.rec} level={this.state.level} framRec={this.state.framRec}/>
			showPropmt = "orange"
			tbklass='collapseButton'
		}
		//
				
			if(this.props.det.interceptor){

				mpui = 	<InterceptorMainPageUI landScape={this.state.landScape} mobile={!this.state.br} df={df} offline={this.state.offline} isUpdating={this.state.isUpdating} isSyncing={this.state.isSyncing} usb={this.state.usb} mac={this.props.det.mac} login={this.toggleLogin} logout={this.logout} toggleTestRModal={this.showTestRModal} testReq={trec} status={status} rejOn={this.state.rejOn} rejLatch={this.state.prodSettings['RejLatchMode'] || this.state.prodSettings['Rej2Latch']} language={this.state.language} setLang={this.setLanguage}
				 toggleCalib={this.showCalibModal} toggleTestModal={this.showTestModal} faultArray={this.state.faultArray} warningArray={this.state.warningArray} clearFaults={this.clearFaults} clearWarnings={this.clearWarnings} toggleSens={this.showSens} toggleConfig={this.showSettings} netpoll={this.state.netpoll} clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} gohome={this.logoClick}
				  ref='im' getProdName={this.getProdName} level={this.state.level} username={this.state.username} />
				cb = <div>
				<div style={{paddingTop:10, paddingBottom:4}}>
					 <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5, fontWeight:500, color:"#eee"}} >
					 <div style={{display:'inline-block', textAlign:'center'}}>{vdefMapV2['@labels']['Learn'][lg]['name']}</div></h2></span></div>
				<InterceptorCalibrateUI mobile={!this.state.br} learnComb={this.state.prodSettings['LearnCombined']}  mac={this.props.det.mac} language={lg} ref='cb' onFocus={this.onCalFocus} onRequestClose={this.onCalClose} sendPacket={this.sendPacket} refresh={this.refresh} calibA={this.calA} calibB={this.calB} /></div>
				
			}
		var testprompt = this.renderTest();
		var CB;
		if(this.state.showCal){
			CB = <SettingsDisplay2 mobile={!this.state.br} mac={this.props.det.mac} Id={this.props.ip+'CALBD'} language={lg} setOverride={this.setCOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'calpage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.pages['Calibration']]} cvdf={vdefByMac[this.props.det.mac][6]['Calibration']} sendPacket={this.sendPacket} prodSettings={this.state.prodSettings} sysSettings={this.state.sysSettings} dynSettings={this.state.rec} level={this.state.level} framRec={this.state.framRec}/>
			showPrompt = "orange"
		}else{
			CB = cb
		}
		var snsCont;
		if(this.state.showSens){

			snsCont = <SettingsDisplay2 mobile={!this.state.br} mac={this.props.det.mac} Id={this.props.ip+'SNSD'} language={lg} setOverride={this.setSOverride} 
			faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} 
			ref = 'snspage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} 
			cob2={[this.state.pages['Sens']]} cvdf={vdefByMac[this.props.det.mac][6]['Sens']} sendPacket={this.sendPacket} 
			prodSettings={this.state.prodSettings} sysSettings={this.state.sysSettings} dynSettings={this.state.rec} level={this.state.level} 
			framRec={this.state.framRec}/>
			showPrompts = "orange"
		}else{
			snsCont = sn;
		}
		var gearStyle = {position:'absolute', display:'block', width:460, textAlign:'right', marginLeft:400}
		var inblk = 'inline-block'
		if(!this.state.br){
			gearStyle = {float:'right', display:'block', textAlign:'right', marginLeft:-40}
			inblk = 'none'
		}
		var tocal = <div style={gearStyle}><div style={{top:65}}>
		<div onClick={this.toggleCalSettings} style={{display:inblk, verticalAlign:'top', paddingTop:5, paddingLeft:20, color:showPrompt}}> {vdefMapV2['@labels']['Settings'][lg].name} </div> 
		<div onClick={this.toggleCalSettings} style={{display:'inline-block'}}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPrompt}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg></div></div>
		</div>		//var tosns = <div  onClick={this.toggleSensSettings}  style={{position:'absolute',left: 840, marginTop:2}}><div style={{position:'absolute', left:-80, marginTop:5, color:showPrompts}}> Settings </div> <div><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPrompts}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg></div></div>
				
  		var tosns =  <div style={gearStyle}><div style={{top:65}}>
		<div  onClick={this.toggleSensSettings}  style={{display:inblk, verticalAlign:'top', paddingTop:5, paddingLeft:20, color:showPrompts}}> {vdefMapV2['@labels']['Settings'][lg].name} </div> 
		<div   onClick={this.toggleSensSettings} style={{display:'inline-block'}}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPrompts}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg></div></div>
		</div>	
		var totest = <div style={gearStyle}><div  style={{top:65}}>
		<div onClick={this.toggleTestSettings}  style={{display:inblk, verticalAlign:'top',  paddingTop:5, paddingLeft:20, color:showPropmt}}> {vdefMapV2['@labels']['Settings'][lg].name} </div> 
		<div  onClick={this.toggleTestSettings} style={{display:'inline-block'}}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPropmt}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg></div></div>
		</div>		

		var tModal = (	<Modal mobile={!this.state.br} ref='tModal' intMeter={true} dfMeter={df} clear={this.clearSig}>
					{testprompt}
				
				</Modal>)
		if(trec == 0){
			tModal = 	<Modal  mobile={!this.state.br} ref='tModal' override={0} intMeter={true} dfMeter={df} clear={this.clearSig}>
					{testprompt}
				
				</Modal>
		}else if(this.state.testRec['TestRecPage'] == 3){
			tModal = <CustomKeyboard language={lg} pwd={false} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='tModal' onChange={this.sendOp} value={''} label={'Operator Code'}/>
		
		}
	
		return(<div style={{minWidth: 290,userSelect: 'none', maxWidth: 1028,marginLeft: 'auto', marginRight:'auto'}}>
			{mpui}	
			<Modal mobile={!this.state.br} ref ='calibModal' onClose={this.calClosed} intMeter={true} dfMeter={df} clear={this.clearSig}>
					{tocal}
				<div>
				{CB}
				</div>	
			</Modal>
			<Modal mobile={!this.state.br} ref='sModal' onClose={this.settingsClosed} intMeter={true} dfMeter={df} clear={this.clearSig}>
					{SD}
				</Modal>
					<Modal mobile={!this.state.br} ref='fModal'>
					<FaultDiv maskFault={this.maskFault} clearFaults={this.clearFaults} faults={this.state.faultArray}/>
				</Modal>
				{tModal}
				<Modal mobile={!this.state.br} ref='teModal' intMeter={true} clear={this.clearSig} dfMeter={df} onClose={this.tmClosed}>
				{totest}	
				{tescont}
				</Modal>
				<Modal mobile={!this.state.br} ref='snModal' intMeter={true} clear={this.clearSig} dfMeter={df} onClose={this.snmClosed}>
				{tosns}
					<div>
					{snsCont}
					</div>
				</Modal>
				<Modal mobile={!this.state.br} ref='loginModal' onClose={()=>this.loginClosed()} intMeter={true} dfMeter={df} clear={this.clearSig}>
					<LogInControl isOpen={this.state.loginOpen} pass6={this.state.sysSettings['PasswordLength']} level={this.state.level}  mac={this.props.det.mac} ip={this.props.ip} logout={this.logout} accounts={this.state.usernames} authenticate={this.authenticate} language={lg} login={this.login} val={this.state.userid}/>
				</Modal>
				<LogInControl2 mobile={!this.state.br}  ref='lgctrl' onRequestClose={this.loginClosed} isOpen={this.state.loginOpen} pass6={this.state.sysSettings['PasswordLength']} level={this.state.level}  mac={this.props.det.mac} ip={this.props.ip} logout={this.logout} accounts={this.state.usernames} authenticate={this.authenticate} language={lg} login={this.login} val={this.state.userid}/>

				<Modal mobile={!this.state.br} ref='syncModal' className='pop-modal' Style={{textAlign:'center', marginTop:40}}>
						<div style={{color:'#e1e1e1'}}>Usb detected. Start sync process?</div>

						<div>
						<button style={{height:50, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:150, borderRadius:20}} onClick={this.startUpdate}>Update</button>
						<button style={{height:50, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:150, borderRadius:20}} onClick={this.startSync}>{vdefMapV2['@labels']['Accept'][lg].name}</button>
						<button style={{height:50, border:'5px solid #808a90', color:'#e1e1e1',background:'#5d5480', width:150, borderRadius:20}} onClick={this.cancelSync}>{vdefMapV2['@labels']['Cancel'][lg].name}</button></div>
	  	
				</Modal>
				</div>)
	} 
}

class AccountControl extends React.Component{
	constructor(props){
		super(props)
		this.state = ({accounts:this.props.accounts, curlevel:0, username:'', pswd:'', newUser:false})
		this.selectChanged = this.selectChanged.bind(this);
		this.addAccount = this.addAccount.bind(this);
		this.removeAccount = this.removeAccount.bind(this);
		this.addNewUser = this.addNewUser.bind(this);

	}
	selectChanged(v){
		this.setState({curlevel:v})
	}
	addAccount(){
		socket.emit('addAccount', {user:{user:this.state.username, acc:this.state.curlevel, password:this.state.pswd}, ip:this.props.ip})
	}
	removeAccount(account){
		socket.emit('removeAccount', {ip:this.props.ip, user:account})
	}
	onFocus(){

	}
	onUserChange(v){
		this.setState({username:v})
	}
	onPswdChange(v){
		this.setState({pswd:v})
	}
	onRequestClose(){

	}
	setLevel(){
		this.refs.pw.toggle();
	}
	setUserName(){
		this.refs.username.toggle();
	}
	setPassword(){
		this.refs.pswd.toggle();
	}
	addNewUser(){
		//this.setState({newUser:true})
	}
	render(){
		var self = this;
		var levels = ['none','operator','technician','engineer']
		var pw = 	<PopoutWheel vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={'Filter Events'} ref='pw' val={[this.state.curlevel]} options={[levels]} onChange={this.selectChanged}/>
		var userkb =  <CustomKeyboard language={this.props.language} num={false} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='user' onChange={this.onUserChange} value={this.state.username} label={'Username'}/>
		var pswdkb =  <CustomKeyboard language={this.props.language} pwd={true} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='pswd' onChange={this.onPswdChange} value={''} label={'Password'}/>
			var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
			var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}

		    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#eee"}} ><div style={{display:'inline-block', textAlign:'center'}}>Accounts</div></h2></span>)
		var st = {padding:7,display:'inline-block', width:180}
		
		//console.log(this.props.accounts)
		var accTableRows = [];
		this.props.accounts.forEach(function(ac,i){
			accTableRows.push(<AccountRow language={self.props.language} lvl={self.props.level} change={self.props.level > ac.acc} username={ac.username} acc={ac.acc} password={'*******'} uid={i} saved={true} ip={self.props.ip}/>)
		})

		return <div style={{maxHeight:350, overflowY:'scroll'}}>
			{userkb}
			{pswdkb}
			{pw}
			<div className='sItem noChild' hidden onClick={this.login}><label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'User Group'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{levels[this.props.val]}</label></div></div>
			</div>
			<table style={{borderCollapse:'collapse',background:"#d1d1d1", width:860}}>
			<tbody>
			<tr ><th>Username</th><th>Passcode</th><th>Level</th></tr>
			{accTableRows}
			</tbody>
			</table>	
		</div>
	}
}
class AccountRow extends React.Component{
	constructor(props){
		super(props);
		this.state = {username:this.props.username, acc:this.props.acc, password:this.props.password, changed:false}
		this.onUserChange = this.onUserChange.bind(this);
		this.onPswdChange = this.onPswdChange.bind(this);
		this.setLevel = this.setLevel.bind(this);
		this.setUserName = this.setUserName.bind(this);
		this.setPassword = this.setPassword.bind(this);
		this.remove = this.remove.bind(this);
		this.saveChanges = this.saveChanges.bind(this);
		this.addAccount = this.addAccount.bind(this);
		this.selectChanged = this.selectChanged.bind(this);
	}
	componentWillReceiveProps(props){
		this.setState({username:props.username, acc:props.acc, password:props.password, changed:false})
	}

	onUserChange(v){
		this.setState({username:v, changed:true})
	}
	onPswdChange(v){
		var pswd = (v+'000000').slice(0,6)
		this.setState({password:pswd, changed:true})
	}
	setLevel(){
		if(this.props.change){
		
			var self = this;
			setTimeout(function(){
		
			self.refs.pw.toggleCont();
			},80);
		}
	}
	selectChanged(v){
		this.setState({acc:v, changed:true})
	}
	setUserName(){
		if(this.props.change){
		
		var self = this;
		setTimeout(function(){
			self.refs.username.toggle();
		},80)
		}
	}
	setPassword(){
		if(this.props.change){
			var self = this;
			setTimeout(function(){
				self.refs.pswd.toggle();
			},80)
		}
	}
	remove(){
		if(this.props.saved){
			socket.emit('removeAccount', {ip:this.props.ip, user:this.state.username})
		}else{
			this.setState({username:this.props.username, acc:this.props.acc, password:this.props.password})
		}
	}
	saveChanges(){
		if(this.props.change){
			this.addAccount();
		}
		
	}
	addAccount(){
		socket.emit('writeUserData', {data:{username:this.state.username, acc:this.state.acc, password:this.state.password, user:this.props.uid}, ip:this.props.ip})
	}
	render(){
		var levels = ['0','1','2','3','4']
		levels = levels.slice(0,this.props.lvl+1)
		var pw = 	<PopoutWheel vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={'Set Level'} ref='pw' val={[this.state.acc]} options={[levels]} onChange={this.selectChanged}/>
		var userkb =  <CustomKeyboard language={this.props.language} num={false} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='username' onChange={this.onUserChange} value={this.state.username} label={'Username'}/>
		var pswdkb =  <CustomKeyboard language={this.props.language} pwd={true} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='pswd' onChange={this.onPswdChange} value={''} label={'Password'}/>
	
			var check= ""
		var dsW = 250;
		var stW = 200;
		if(this.props.editMode){
			dsW = 380;
			stW = 330;
		}
		var bg = "#d1d1d1"
		var buttons = ""
		if(this.state.changed){
			buttons = <div style={{display:'inline-block'}}><button onClick={this.saveChanges}>Save Changes</button></div>

		}
		var ds = {paddingLeft:7, display:'inline-block', width:740, background:bg}
		var st = {padding:7,display:'inline-block', width:180}
		var mgl = -90
		
		var password = this.state.password.split("").map(function(c){return '*'}).join('');
		/*return <div style={{background:"#362c66", color:"#000", position:'relative', textAlign:'left'}}>
		{pw}{userkb}{pswdkb}
		<div style={ds} ><label style={st} onClick={this.setUserName}>{this.state.username}</label><label onClick={this.setPassword} style={st}>{password}</label><label onClick={this.setLevel} style={{display:'inline-block', width:40, padding:7}}>{this.state.acc}</label>{buttons}</div></div>*/
		return <tr style={{background:bg, textAlign:'center'}}><td style={{padding:7, width:200}} onClick={this.setUserName}>{this.state.username}</td>
		<td onClick={this.setPassword} style={{padding:7, width:200}}>{password}</td><td onClick={this.setLevel} style={{padding:7, width:120}}>{this.state.acc}</td><td>{buttons}{pw}{pswdkb}{userkb}</td></tr>
	}
}

class NetPollView extends React.Component{
	constructor(props) {
		super(props)
		this.state =({events:[], curFilter:0})
		this.pushEvent = this.pushEvent.bind(this);
		this.onNetpoll = this.onNetpoll.bind(this);
		this.changeFilter = this.changeFilter.bind(this);
		this.selectChanged = this.selectChanged.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	onNetpoll(e){
		this.pushEvent(e)
	}
	pushEvent (e) {
		// body...
		var events = this.state.events
		if(events.length == this.props.eventCount){
			events.splice(-1,1);
		}
		events.unshift(e);
		this.setState({events:events})
	}
	dummyEvent () {
	}
	changeFilter(){
		var self = this;
		setTimeout(function(){
			self.refs.pw.toggleCont();
		
		},100);
	}	
	selectChanged(v){
		this.setState({curFilter:v})
	}
	renderMobile(){
		var self = this;
		var buttStyle = {display:'inline-block', marginLeft:5, marginRight:5, height: 30, lineHeight:'30px', width:120, borderRadius:20}
		var innerStyle = {display:'inline-block', position:'relative',top:-2,width:'100%', color:"#e1e1e1", fontSize:14,lineHeight:2.2}
		var eventArr = []
		if(this.state.curFilter == 0){
			//eventArr = this.props.events.slice(0); (hack)
			this.props.events.forEach(function(e){
				if(e.net_poll_h != 'NETPOLL_STREAM_FRAM'){
					eventArr.push(e)
				}
			})
		}else if(this.state.curFilter == 1){
			this.props.events.forEach(function(ev){
				if(ev.net_poll_h == "NET_POLL_REJECT_ID"){
					eventArr.push(ev)
				}
			})
		}else if(this.state.curFilter == 2){
			this.props.events.forEach(function(ev){
				if(ev.net_poll_h == "NET_POLL_FAULT"){
					eventArr.push(ev)
				}
			})
		}else if(this.state.curFilter == 3){
			this.props.events.forEach(function(ev){
				if(ev.net_poll_h == "NET_POLL_TEST_REQ_PASS"){
					eventArr.push(ev)
				}
			})
		}
		//console.log(['6536',self.props.mac])
		var events = eventArr.map(function(e){
			var ev = e.net_poll_h;
			if(netMap[e.net_poll_h]){
				ev = netMap[e.net_poll_h]['@translations'][self.props.language]['name']	
			}
			var dateTime = e.date_time.year + '/' + e.date_time.month + '/' + e.date_time.day + ' ' + e.date_time.hours+ ':' + e.date_time.min + ':' + e.date_time.sec;
			var rejects = e.rejects
			var faults = e.faults
			var string = ""
			//////console.log(['4163',e])
			if(e.net_poll_h == "NET_POLL_REJECT_ID"){

				string = 'rejects:' + rejects.number + ', signal:' + rejects.signal;

			}else if((e.net_poll_h == 'NET_POLL_PROD_REC_VAR')||(e.net_poll_h == 'NET_POLL_PROD_SYS_VAR')){
				//console.log(6957,e)
				if(e.parameters[0]){
				if(e.parameters[0].value != null){


					string = e.parameters[0].param_name + ': ' + e.parameters[0].value
				}else if(e.parameters[0].label.type != null){
					var lg = self.props.language
					if(typeof vdefByMac[self.props.mac][0]['@labels'][e.parameters[0].label.type][self.props.language] == 'undefined'){
						lg = 'english'
					}else if(vdefByMac[self.props.mac][0]['@labels'][e.parameters[0].label.type][self.props.language][e.parameters[0].label.value].trim().length == 0){
						lg = 'english'
					}
					string = e.parameters[0].param_name + ': ' + vdefByMac[self.props.mac][0]['@labels'][e.parameters[0].label.type][lg][e.parameters[0].label.value];
				}
			}
			}else if(e.net_poll_h == 'NET_POLL_FAULT'){
				if(e.faults.length != 0){
					e.faults.forEach(function(f, i){
						string += vdefByMac[self.props.mac][0]['@labels'].FaultSrc[self.props.language][f]
						if(i + 1 <e.faults.length ){
							string += ", "
						}
					})
				}else{
					string = 'No Faults'
				}
				
				//vdefByMac[this.props.ip][0]['@labels'].FaultSrc[]
			}


			return (<tr><td style={{width:'20%', fontSize:12}}>{dateTime}</td><td style={{width:'15%', fontSize:12}}>{e.username}</td><td style={{width:'30%', fontSize:12}}>{ev}</td><td style={{width:'35%', fontSize:12}}>{string}</td></tr>)
		})
		var filters = ['All', 'Rejects', 'Faults', 'Tests']
		// body... 
		return (<div>
			<div style={{textAlign:'center'}}><label style={{fontSize:26,width:100,paddingLeft: 20,color:'#e1e1e1'}}>{vdefMapV2['@labels']['Events'][this.props.language]['name']}</label></div>
			<div>	
			<div style={{position:'relative', textAlign:'center'}}>
			<CircularButton style={{display:'inline-block', marginLeft:5, marginRight:5, height: 30, lineHeight:'30px', width:120, borderRadius:20}} innerStyle={innerStyle} selected={(this.state.curFilter == 0)} lab={'All'} onClick={()=>this.selectChanged(0)}/>
			<CircularButton style={{display:'inline-block', marginLeft:5, marginRight:5, height: 30, lineHeight:'30px', width:120, borderRadius:20}} innerStyle={innerStyle} selected={(this.state.curFilter == 1)} lab={'Rejects'} onClick={()=>this.selectChanged(1)}/>
			<CircularButton style={{display:'inline-block', marginLeft:5, marginRight:5, height: 30, lineHeight:'30px', width:120, borderRadius:20}} innerStyle={innerStyle} selected={(this.state.curFilter == 2)} lab={'Faults'} onClick={()=>this.selectChanged(2)}/>
			<CircularButton style={{display:'inline-block', marginLeft:5, marginRight:5, height: 30, lineHeight:'30px', width:120, borderRadius:20}} innerStyle={innerStyle} selected={(this.state.curFilter == 3)} lab={'Tests'} onClick={()=>this.selectChanged(3)}/>
			</div>
				
			<div style={{color:'#e1e1e1'}}>
			<table className='npTable'>
			<thead style={{display:'block', width:'100%'}}><tr style={{background:'transparent', fontSize:12}}><th style={{width:'20%'}}>{vdefMapV2['@labels']['Timestamp'][this.props.language]['name']}</th><th style={{width:"15%"}}>User</th><th style={{width:"30%"}}>{vdefMapV2['@labels']['Event'][this.props.language]['name']}</th><th style={{width:"35%"}}>{vdefMapV2['@labels']['Details'][this.props.language]['name']}</th></tr>
		</thead>
			<tbody>
				{events}
			</tbody></table>
			</div>
			</div>

		</div>)
	}
	render () {
		if(this.props.mobile){
			return this.renderMobile()
		}
		var self = this;
		var eventArr = []
		if(this.state.curFilter == 0){
			//eventArr = this.props.events.slice(0); (hack)
			this.props.events.forEach(function(e){
				if(e.net_poll_h != 'NETPOLL_STREAM_FRAM'){
					eventArr.push(e)
				}
			})
		}else if(this.state.curFilter == 1){
			this.props.events.forEach(function(ev){
				if(ev.net_poll_h == "NET_POLL_REJECT_ID"){
					eventArr.push(ev)
				}
			})
		}else if(this.state.curFilter == 2){
			this.props.events.forEach(function(ev){
				if(ev.net_poll_h == "NET_POLL_FAULT"){
					eventArr.push(ev)
				}
			})
		}else if(this.state.curFilter == 3){
			this.props.events.forEach(function(ev){
				if(ev.net_poll_h == "NET_POLL_TEST_REQ_PASS"){
					eventArr.push(ev)
				}
			})
		}
		//console.log(['6536',self.props.mac])
		var events = eventArr.map(function(e){
			var ev = e.net_poll_h;
			if(netMap[e.net_poll_h]){
				ev = netMap[e.net_poll_h]['@translations'][self.props.language]['name']	
			}
			var dateTime = e.date_time.year + '/' + e.date_time.month + '/' + e.date_time.day + ' ' + e.date_time.hours+ ':' + e.date_time.min + ':' + e.date_time.sec;
			var rejects = e.rejects
			var faults = e.faults
			var string = ""
			//////console.log(['4163',e])
			if(e.net_poll_h == "NET_POLL_REJECT_ID"){

				string = 'rejects:' + rejects.number + ', signal:' + rejects.signal;

			}else if((e.net_poll_h == 'NET_POLL_PROD_REC_VAR')||(e.net_poll_h == 'NET_POLL_PROD_SYS_VAR')){
				//console.log(6957,e)
				if(e.parameters[0]){
				if(e.parameters[0].value != null){


					string = e.parameters[0].param_name + ': ' + e.parameters[0].value
				}else if(e.parameters[0].label.type != null){
					var lg = self.props.language
					if(typeof vdefByMac[self.props.mac][0]['@labels'][e.parameters[0].label.type][self.props.language] == 'undefined'){
						lg = 'english'
					}else if(vdefByMac[self.props.mac][0]['@labels'][e.parameters[0].label.type][self.props.language][e.parameters[0].label.value].trim().length == 0){
						lg = 'english'
					}
					string = e.parameters[0].param_name + ': ' + vdefByMac[self.props.mac][0]['@labels'][e.parameters[0].label.type][lg][e.parameters[0].label.value];
				}
			}
			}else if(e.net_poll_h == 'NET_POLL_FAULT'){
				if(e.faults.length != 0){
					e.faults.forEach(function(f, i){
						string += vdefByMac[self.props.mac][0]['@labels'].FaultSrc[self.props.language][f]
						if(i + 1 <e.faults.length ){
							string += ", "
						}
					})
				}else{
					string = 'No Faults'
				}
				
				//vdefByMac[this.props.ip][0]['@labels'].FaultSrc[]
			}


			return (<tr><td style={{width:185}}>{dateTime}</td><td style={{width:135, fontSize:16}}>{e.username}</td><td style={{width:185, fontSize:16}}>{ev}</td><td style={{width:295, fontSize:16}}>{string}</td></tr>)
		})
		var filters = ['All', 'Rejects', 'Faults', 'Tests']
		// body... 
		return (<div>
			<div style={{textAlign:'center'}}><label style={{fontSize:26,width:100,paddingLeft: 20,color:'#e1e1e1'}}>{vdefMapV2['@labels']['Events'][this.props.language]['name']}</label></div>
			<div>	
			<div style={{position:'relative', textAlign:'center'}}>
			<CircularButton style={{width:170, display:'inline-block', marginLeft:5, marginRight:5}} selected={(this.state.curFilter == 0)} lab={'All'} onClick={()=>this.selectChanged(0)}/>
			<CircularButton style={{width:170, display:'inline-block', marginLeft:5, marginRight:5}} selected={(this.state.curFilter == 1)} lab={'Rejects'} onClick={()=>this.selectChanged(1)}/>
			<CircularButton style={{width:170, display:'inline-block', marginLeft:5, marginRight:5}} selected={(this.state.curFilter == 2)} lab={'Faults'} onClick={()=>this.selectChanged(2)}/>
			<CircularButton style={{width:170, display:'inline-block', marginLeft:5, marginRight:5}} selected={(this.state.curFilter == 3)} lab={'Tests'} onClick={()=>this.selectChanged(3)}/>
			</div>
				
			<div style={{color:'#e1e1e1'}}>
			<table className='npTable'>
			<thead><tr style={{background:'transparent', fontSize:16}}><th style={{width:185}}>{vdefMapV2['@labels']['Timestamp'][this.props.language]['name']}</th><th style={{width:135}}>User</th><th style={{width:185}}>{vdefMapV2['@labels']['Event'][this.props.language]['name']}</th><th style={{width:295}}>{vdefMapV2['@labels']['Details'][this.props.language]['name']}</th></tr>
		</thead>
			<tbody>
				{events}
			</tbody></table>
			</div>
			</div>

		</div>)
	}
}
class ProductItem extends React.Component{
	constructor(props) {
		super(props)
		this.state = {name:this.props.name}
		this.switchProd = this.switchProd.bind(this);
		this.copyProd = this.copyProd.bind(this);
		this.deleteProd = this.deleteProd.bind(this);
		this.editName = this.editName.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.accept = this.accept.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	componentWillReceiveProps (newProps) {
		this.setState({name:newProps.name})
	}
	switchProd () {
		var self = this;
		if(!this.props.selected){
			setTimeout(function(){

			self.refs.cfmodal.show();
		},100)	
		}
		
	}
	accept (){
		this.props.switchProd(this.props.p)
	}
	copyProd () {
		this.props.copy();
	}
	deleteProd () {
		if(this.props.selected){
			this.props.deleteCurrent(this.props.p);
	
		}
		//this.props.delete(this.props.p)
	}
	editName () {
		var self = this;
		setTimeout(function () {
		self.refs.nameinput.toggle()
	},100)
	}
	onChange (v) {
		this.setState({name:v})
		this.props.editName(v)
	}
	onFocus () {
		this.props.onFocus();
	}
	onRequestClose() {
		// body...
		this.props.onRequestClose();
	}
	renderMobile(){
		var check= ""
		var dsW = '98%';
		var chkwd = '5%'
		var bkgr = "#362c66"
		var ds = {paddingLeft:'2%', display:'inline-block', width:dsW, background:"#d1d1d1"}
		var st = {padding:7,display:'inline-block',height:50, lineHeight:'50px',fontSize:17}
		var mgl = -90
		var buttons// = <button className='deleteButton' onClick={this.deleteProd}/>
		if(this.props.selected){
			bkgr = "#5aaa5a"
			check = <img src="assets/Check_mark.svg" style={{width:'100%'}}/>
			ds.background = "#5aaa5a";
			//st = {color:'green', padding:7, display:'inline-block', width:200}
			mgl = -160
			buttons = <div style={{display:'inline-block'}}>
			<CustomAlertClassedButton alertMessage={'Do you want to delete the current product?'} className='deleteButton_m' style={{display:'inline-block'}} onClick={this.deleteProd}/><button className='copyButton_m' style={{paddingLeft:0, paddingRight:0}} onClick={this.copyProd}></button>
			<button className='editButton_m' style={{paddingLeft:0, paddingRight:0}} onClick={this.editName}></button>
			<CustomKeyboard mobile={true} language={this.props.language} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='nameinput' onChange={this.onChange} value={this.state.name} label={this.state.name}/>
		
			</div>
		}
		var name = 'Product '+this.props.p
		if(this.props.name.length > 0){
			name = this.props.name
		}
		var editRow ="";
		if(this.props.editMode){
			if(this.props.selected){
				editRow = <div style={{display:'inline-block', width:'40%', background:"#5aaa5a"}}>{buttons}</div>
				chkwd = '8.3%'
				ds.width = '58%'
			}
			

		}
		return (<div style={{background:bkgr, color:"#000", position:'relative', textAlign:'left'}}><div style={ds }onClick={this.switchProd}  ><div style={{display:'inline-block', width:chkwd}}>{check}</div><label style={st}>{this.props.p + '.  ' +name}</label></div>{editRow}
				<AlertModal ref='cfmodal' accept={this.accept}>
					<div style={{color:'#e1e1e1'}}>{"Do you want to run " + name}</div>
				</AlertModal>
			</div>)
	}
	render () {
		// body..
		if(this.props.mobile){
			return this.renderMobile()
		}
		var check= ""
		var dsW = 250;
		var stW = 212;
		if(this.props.editMode){
			dsW = 380;
			stW = 342;
		}
		var ds = {paddingLeft:7, display:'inline-block', width:dsW, background:"#d1d1d1"}
		var st = {padding:7,display:'inline-block', width:stW, height:65, lineHeight:'65px',fontSize:22}
		var mgl = -90
		var buttons// = <button className='deleteButton' onClick={this.deleteProd}/>
		if(this.props.selected){
			check = <img src="assets/Check_mark.svg"/>
			ds = {paddingLeft:7,display:'inline-block', width:dsW,	 background:"#5aaa5a"}
			//st = {color:'green', padding:7, display:'inline-block', width:200}
			mgl = -160
			buttons = <div style={{display:'inline-block'}}><CustomAlertClassedButton alertMessage={'Do you want to delete the current product?'} className='deleteButton' style={{display:'inline-block'}} onClick={this.deleteProd}/><button className='copyButton' style={{paddingLeft:0, paddingRight:0}} onClick={this.copyProd}></button>
			<button className='editButton' style={{paddingLeft:0, paddingRight:0}} onClick={this.editName}></button>
			<CustomKeyboard language={this.props.language} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='nameinput' onChange={this.onChange} value={this.state.name} label={this.state.name}/>
		
			</div>
		}
		var name = 'Product '+this.props.p
		if(this.props.name.length > 0){
			name = this.props.name
		}
		var editRow ="";
		if(this.props.editMode){
			editRow = <div style={{display:'inline-block', marginLeft:mgl, position:'absolute', marginTop:20}}>{buttons}</div>
		}
		return (<div style={{background:"#362c66", color:"#000", position:'relative', textAlign:'left'}}><div style={ds} ><div style={{display:'inline-block', width:22}}>{check}</div><label onClick={this.switchProd} style={st}>{this.props.p + '.  ' +name}</label></div>{editRow}
				<AlertModal ref='cfmodal' accept={this.accept}>
					<div style={{color:'#e1e1e1'}}>{"Do you want to run " + name}</div>
				</AlertModal>
			</div>)
	}
}
class ProdList extends React.Component{
	constructor(props){
		super(props)
	}
	render(){
		var self = this;
		var prodNames = this.props.prodNames

		var splitArray = []
		if(this.props.prodList.length > 8){

		}

		var prodList = this.props.prodList.map(function(p, i){
			var sel = false
			if(p==self.props.sysRec['ProdNo']){
				sel = true;
			}
			var name = ""
			if(typeof prodNames[i] != 'undefined'){
				name = prodNames[i]
			}
			return (<ProductItem language={this.props.language} onFocus={self.prodFocus} onRequestClose={self.prodClose} selected={sel} p={p} name={name} editName={self.editName} editMode={self.state.peditMode} copy={self.copyCurrentProd} delete={self.deleteProd} switchProd={self.switchProd}/>)
		})



		return <div>
			
		</div>
	}
}

class TestReq extends React.Component{
	constructor(props) {
		super(props)
		this.testMan = this.testMan.bind(this);
		this.testMan2 = this.testMan2.bind(this);
		this.testHalo = this.testHalo.bind(this);
		this.testHalo2 = this.testHalo2.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	testMan () {
		var packet = dsp_rpc_paylod_for(19,[32,0,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		packet = null;
		this.props.toggle()
	}
	testMan2 () {
		var packet = dsp_rpc_paylod_for(19,[32,2,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		packet = null;
		this.props.toggle()
	}
	testHalo () {
		var packet = dsp_rpc_paylod_for(19,[32,1,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		packet = null;
		this.nextProps.toggle()
	}
	testHalo2 () {
		var packet = dsp_rpc_paylod_for(19,[32,3,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		packet = null;
		this.props.toggle()
	}
	sendOp () {
		// body...
		var packet = dsp_rpc_paylod_for(21,[14,0,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		
	}
	quitTest () {
		// body...
		var packet = dsp_rpc_paylod_for(21,[15,0,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		
	}
	renderMobile(){
		
				var testcont = ''
		var ack = ''
		var tdstyle = {width:220}

		var tdstyleintA = { background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))'}
		var testModes = ['Manual','Halo','Manual 2', 'Halo 2']
		var _tcats = ['Manual','Halo','Manual2','Halo2']
		var metTypes = ['Ferrous','Non-Ferrous','Stainless Steel']
		var schain = ['B','A']
		var opts = []
		var cnt = 0;
		var options = ""
		var funcs = [this.testMan, this.testHalo, this.testMan2, this.testHalo2]
		var fnames = ['Manual','Halo','Manual 2', 'Halo 2']
		for(var i = 0; i<4;i++){
			if(this.props.settings['TestConfigCount'+i+'_0']>0){
				opts.push(<div style={{marginLeft:5, marginRight:5}}>	<CircularButton style={{width:'100%', marginLeft:-8, height:43, borderWidth:5}} lab={fnames[i]} onClick={funcs[i]}/></div>)
				cnt++;
			}else{
				opts.push(<div  style={{marginLeft:5, marginRight:5}}>	<CircularButton style={{width:'100%', marginLeft:-8, height:43, borderWidth:5}} lab={fnames[i]} disabled={true} onClick={funcs[i]}/></div>)
			}
		}
		if(cnt == 0){
			options = <div style={{fontSize:25}}>No Tests Configured</div>
		}else{
			options = opts
		}

			
		
		
		testcont = <div  style={{color:'#e1e1e1'}}	>
					<div style={{fontSize:25}}>Select Test</div>

					{options}
				</div>

			
		
		var testprompt = <div>{testcont} </div>
		return testprompt
	}
	render () {
		if(this.props.mobile){
			return this.renderMobile()
		}
		var testcont = ''
		var ack = ''
		var tdstyle = {width:220}

		var tdstyleintA = { background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))'}
		var testModes = ['Manual','Halo','Manual 2', 'Halo 2']
		var _tcats = ['Manual','Halo','Manual2','Halo2']
		var metTypes = ['Ferrous','Non-Ferrous','Stainless Steel']
		var schain = ['B','A']
		var opts = []
		var cnt = 0;
		var options = ""
		var funcs = [this.testMan, this.testHalo, this.testMan2, this.testHalo2]
		var fnames = ['Manual','Halo','Manual 2', 'Halo 2']
		for(var i = 0; i<4;i++){
			if(this.props.settings['TestConfigCount'+i+'_0']>0){
				opts.push(	<CircularButton lab={fnames[i]} onClick={funcs[i]}/>)
				cnt++;
			}else{
				opts.push(	<CircularButton lab={fnames[i]} disabled={true} onClick={funcs[i]}/>)
			}
		}
		if(cnt == 0){
			options = <div style={{fontSize:25}}>No Tests Configured</div>
		}else{
			options =<table>
						<tbody><tr>
							<td style={tdstyle}>{opts[0]}</td><td style={tdstyle}>{opts[1]}</td>
						</tr><tr>
							<td style={tdstyle}>{opts[2]}</td><td style={tdstyle}>{opts[3]}</td>	
						</tr></tbody>
					</table>
		}

			
		
		
		testcont = <div  style={{color:'#e1e1e1'}}	>
					<div style={{fontSize:25}}>Select Test</div>
					<table hidden>
						<tbody><tr>
							<td style={tdstyle} onClick={this.testMan}>Manual</td><td style={tdstyle} onClick={this.testHalo}>Halo</td>
						</tr><tr>
							<td style={tdstyle} onClick={this.testMan2}>Manual 2</td><td style={tdstyle} onClick={this.testHalo2}>Halo 2</td> 
						</tr></tbody>
					</table>
					{options}
				</div>

			
		
		var testprompt = <div>{testcont} </div>
		return testprompt
	}
}

class DummyGraph extends React.Component{
	constructor(props) {
		super(props)
		var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 444px)'),
			window.matchMedia('(min-width: 600px)'),
			window.matchMedia('(min-width: 850px)')
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		this.state = ({width:480, height:230, mqls:mqls})
	}
	listenToMq () {
	}
	componentDidMount () {
		this.listenToMq()
	}
	renderCanv () {
		return(<CanvasElem df={this.props.df} canvasId={this.props.canvasId} ref='cv' w={this.state.width} h={this.state.height} int={this.props.int} mpp={20}/>)
	}
	stream (dat) {
		this.refs.cv.stream(dat)
	}
	render () {
		var cv = this.renderCanv()
		return (<div className='detGraph'>
			{cv}
			</div>)
	}

}
class SlimGraph extends React.Component{
	constructor(props) {
		super(props)
		/*var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 444px)'),
			window.matchMedia('(min-width: 600px)'),
			window.matchMedia('(min-width: 850px)')
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}*/
		this.state = ({width:480, height:215, popUp:false})
		this.toggle = this.toggle.bind(this);
		this.stream = this.stream.bind(this);
		this.pauseGraph = this.pauseGraph.bind(this);
		this.restart = this.restart.bind(this);
	}
	pauseGraph(){
		//console.log('lower res')
		this.refs.cv.pauseGraph();
	}
	restart(){
		this.refs.cv.restart();
	}
	listenToMq () {
		// body...
		if(this.state.mqls[3].matches){
			this.setState({width:480})
		}else if(this.state.mqls[2].matches){
			this.setState({width:558})
		}else if(this.state.mqls[1].matches){
			this.setState({width:480})
		}else{
			this.setState({width:280})
		}
	}
	componentDidMount () {
		//this.listenToMq()
	}
	renderCanv () {
		if(this.state.popUp){
			return <GraphModal Style={{maxWidth:950,width:950,marginTop:100, background:'#000'}} innerStyle={{backgroundColor:'black'}} show={true} onClose={this.toggle}>
				<CanvasElem combineMode={this.props.combineMode} sens={this.props.sens} thresh={this.props.thresh} df={true} canvasId={this.props.canvasId} ref='cv' w={900} h={400} int={this.props.int} mpp={13}/>
			</GraphModal>
		}
		return(<CanvasElem combineMode={this.props.combineMode} sens={this.props.sens} thresh={this.props.thresh} df={true} canvasId={this.props.canvasId} ref='cv' w={this.state.width} h={this.state.height} int={this.props.int} mpp={28}/>)
	}
	stream (dat, ov) {
		if(!ov){
			this.refs.cv.stream(dat)
		}
		
	}
	toggle(){
		var self = this;
		setTimeout(function(){
			self.setState({popUp:!self.state.popUp})
		},100)
		
	}
	render () {
		//img src='assets/fullscreen.svg'
		var cv = this.renderCanv()
		return (<div className='detGraph'>
			<div  style={{position:'absolute', top:76,left:63, width:350,height:140}} onClick={this.toggle}/>
			{cv}
			</div>)
	}

}
class GraphModal extends React.Component{
	constructor(props) {
		super(props)
		var klass = 'custom-modal'
		if(this.props.className){
			klass = this.props.className
		}
		this.state = ({className:klass, show:false, override:false ,keyboardVisible:false});
		this.toggle = this.toggle.bind(this);
	}
	toggle () {
		var self = this;
		if(!this.state.override){
			if(this.props.show){
			this.setState({show:false, override:true})

		
			setTimeout(function(){
				//hack - sometimes the open and close will fire simultaneously, disable closing in the 50 ms after opening
				self.setState({override:false})
				if(typeof self.props.onClose != 'undefined'){
			
					self.props.onClose();
				}
			},50)
			}else{
				this.setState({show:true, override:true})

		
				setTimeout(function(){
				//hack - sometimes the open and close will fire simultaneously, disable closing in the 50 ms after opening
				self.setState({override:false})

				},50)
			}
		}

		
	}
	render () {
		var cont = '';
		var h = !this.props.show
		if(typeof this.props.override != 'undefined'){
			if(this.props.override == 1){
				h = false
			}else{
				h = true
			}
		}


		if(!h){
			
			cont = (<GModalCont toggle={this.props.onClose} Style={this.props.Style} innerStyle={this.props.innerStyle}>
				{this.props.children}
			</GModalCont>)
		}

		return(<div className={this.state.className} hidden={h}>
{/*	<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>*/}
			{cont}
		</div>)
	}
}
class GModalC extends React.Component{
	constructor(props){
		super(props);
		this.state = {keyboardVisible:false}
		this.toggle = this.toggle.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
	}
	toggle(){
		this.props.toggle()
	}
	handleClickOutside(e){
		if(!this.state.keyboardVisible){
			this.props.toggle();	
		}	
	}
	render() {
		var style= this.props.Style || {}
		var cs = this.props.innerStyle || {}
		var button = 	<button className='modal-close' onClick={this.toggle}><img className='closeIcon' src='assets/Close-icon.png'/></button>
			
				return (<div className='modal-outer' style={style}>
				<div className='modal-content' style={cs}>
					{this.props.children}
				</div>
				</div>)
	
	}
}
var GModalCont = onClickOutside(GModalC);
class StealthMainPageUI extends React.Component{
	constructor(props) {
		super(props)
		// body...
		var res = vdefByMac[this.props.det.mac]
		var pVdef = _pVdef;
		if(res){
			pVdef = res[1];

		}
		var res = null;
		this.state ({rpeak:0,xpeak:0,peak:0,phase:0,rej:0, sysRec:{},prodRec:{},tmp:'',prodList:[],phaseFast:0,pVdef:pVdef})
				this.keyboardOpen = this.keyboardOpen.bind(this);
		this.keyboardClose = this.keyboardClose.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onButton = this.onButton.bind(this);
		this.clearRej = this.clearRej.bind(this);
		this.switchProd = this.switchProd.bind(this);
		this.clearPeak = this.clearPeak.bind(this);
		this.sendPacket = this.sendPacket.bind(this);
		this.parseInfo = this.parseInfo.bind(this);
		this.showEditor = this.showEditor.bind(this);
		this.calibrate = this.calibrate.bind(this);
		this.setTest = this.setTest.bind(this);
		this.updateTmp = this.updateTmp.bind(this);
		this.submitTmpSns = this.submitTmpSns.bind(this);
		this.refresh = this.refresh.bind(this);
		this.gohome = this.gohome.bind(this);
		this.setProdList = this.setProdList.bind(this);
		this.getProdName = this.getProdName.bind(this);
		this.prodFocus = this.prodFocus.bind(this);
		this.prodClose = this.prodClose.bind(this);
		this.changeProdEditMode = this.changeProdEditMode.bind(this);
		this.copyCurrentProd = this.copyCurrentProd.bind(this);
		this.deleteProd = this.deleteProd.bind(this);
		this.editName = this.editName.bind(this);
	}
	sendPacket (n,v) {
		//
		this.props.sendPacket(n,v)
	}
	parseInfo(sys, prd){
		if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){
			this.setState({sysRec:sys, prodRec:prd, tmp:prd['Sens']})
		}
	}
	componentDidMount(){
		var self = this;
		this.sendPacket('refresh','')
		socket.on('prodNames', function (pack) {
			// body...
			//////console.log(['5369', pack])
			if(self.props.det.ip == pack.ip){
				self.setState({prodList:pack.list, prodNames:pack.names})
			}
		})
	}
	clearRej () {
		var param = this.state.pVdef[2]['RejCount']
		this.props.clear(param )
	}
	switchProd (p) {
		//
		this.props.sendPacket('ProdNo',p)
	}
	clearPeak () {
		var p = 'Peak'
		
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
	}
	update (sig) {
		var dat = {t:Date.now(),val:sig}
		this.refs.nv.streamTo(dat)
		this.refs.dv.update(sig)
	}
	refresh () {
		//
		this.props.sendPacket('refresh')
	}
	cancel () {
		this.refs.sensEdit.toggle()
		this.setState({tmp:''})
	}
	showEditor () {

		var self = this;
		this.refs.pedit.toggle()
		setTimeout(function () {
			// body...
			self.setState({peditMode:false})
			socket.emit('getProdList', self.props.det.ip)
		//	self.props.sendPacket('getProdList')
		},100)		
	}
	calibrate () {
		//
		this.refs.calibModal.toggle()
	}
	_handleKeyPress (e) {
		if(e.key === 'Enter'){
			this.submitTmpSns();
		}
	}
	sensFocus(){
		//
		this.refs.sensEdit.setState({override:true})
	}
	sensClose(){
		//
		var self = this;
		setTimeout(function(){
			self.refs.sensEdit.setState({override:false})	
		}, 100)
	}
	gohome () {
		//
		this.props.gohome();
	}
	toggleNetpoll () {
		//
		this.refs.netpolls.toggle();
	}
	onButton (f) {
			
		if(f == 'test'){
			if(typeof this.state.prodRec['TestMode'] != 'undefined'){
			if(this.state.prodRec['TestMode'] != 0){
				this.props.sendPacket('test', this.state.prodRec['TestMode'] - 1)
			}else{
				//this.toggleTestModal()
				this.props.toggleTestModal();
			}
			
		}	
		}else if(f == 'log'){
			this.toggleNetpoll();
		}else if(f == 'config'){
			this.props.toggleConfig();
		}else if(f == 'prod'){
			this.showEditor();
		}else if(f == 'cal'){
			this.props.toggleCalib();
		}else if(f=='sig'){
			this.clearPeak();
		}else if(f=='rej'){
			this.clearRej();
		}else if(f=='sens'){
			this.props.toggleSens();
		}
	}
	onSens (e,s) {
		this.props.sendPacket(s,e);
	}
	setProdList (prodList) {
		var self = this;
		this.setState({prodList:prodList, curInd:0})
		setTimeout(function () {
			self.getProdName(prodList[0],self.setProdName,0)

		},100)
	}
	getProdName (p,cb,i) {
		this.props.getProdName(p,cb,i)
	}
	setProdName (name, ind) {
		var sa = []
		name.slice(3,23).forEach(function (i) {
			sa.push(i)
		})
		var self = this;
		var str = sa.map(function(ch){
			return String.fromCharCode(ch)
		}).join("").replace("\u0000","").trim();
		//////console.log(['5888',str])
		var prodNames = this.state.prodNames;
		prodNames[ind] = str
		if(ind + 1 < this.state.prodList.length){
			var i = self.state.prodList[ind+1]
			self.setState({prodNames:prodNames})
			setTimeout(function () {
				self.getProdName(i, self.setProdName, ind+1)
				
			},100)
			
		}else{
			this.setState({prodNames:prodNames})
		}
	}
	prodFocus(){
		this.refs.pedit.setState({override:true})
	}
	prodClose(){
		var self = this;
		setTimeout(function(){
			self.refs.pedit.setState({override:false})	
		}, 100)
	}
	changeProdEditMode () {
		this.setState({peditMode:!this.state.peditMode})
	}
	copyCurrentProd () {
		var nextNum = this.state.prodList[this.state.prodList.length - 1] + 1;
		this.sendPacket('copyCurrentProd', nextNum);
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	deleteProd (p) {
		this.sendPacket('deleteProd',p)
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	editName (name) {
		this.sendPacket('ProdName',name)
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	defaultSave(){
		this.sendPacket('DefaultSave')
	}
	defaultRestore(){
		this.sendPacket('DefaultRestore')
	}
	onCalFocus () {
		this.refs.calibModal.setState({override:true})
	}
	onCalClose () {
		var self = this;
		setTimeout(function () {
			// body...
				self.refs.calibModal.setState({override:false})
		},100)
	
	}
	render () {
		// body...
		var home = 'home'
		var style = {background:'#362c66', width:'100%',display:'block', height:'-webkit-fill-available'}
		var lstyle = {height: 50,marginRight: 20, marginLeft:10}
		var self = this;
		var prodNames = this.state.prodNames
		//////console.log(this.state.prodList.chunk(8))
		var prodList = this.state.prodList.map(function(p, i){
			var sel = false
			if(p==self.state.sysRec['ProdNo']){
				sel = true;
			}
			var name = ""
			if(typeof prodNames[i] != 'undefined'){
				name = prodNames[i]
			}
			return (<ProductItem onFocus={self.prodFocus} onRequestClose={self.prodClose} selected={sel} p={p} name={name} editName={self.editName} editMode={self.state.peditMode} copy={self.copyCurrentProd} delete={self.deleteProd} switchProd={self.switchProd}/>)
		})
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']// ['english','korean']
		var lg = lgs[this.props.language]
		if(vdefMapV2['@languages'].indexOf(lg) == -1){
			lg = 'english'
			//default to english
		}
		
		var ps = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed']]
		if(this.state.phaseFast == 1){
			ps = 'fast'
		}
			var peditCont = (<div>
				<div><button style={{float:'right'}} className='editButton' onClick={this.changeProdEditMode}>Edit Products</button></div>
				<div style={{display:'inline-block', width:600, maxHeight:400, overflowY:'scroll'}}>{prodList}</div><div style={{float:'right'}}></div>
			</div>)
		return(<div className='stealthMainPageUI' style={style}>
			<table className='landingMenuTable' style={{marginBottom:-4, marginTop:-7}}>
						<tbody>
							<tr>
								<td><img style={lstyle}  src='assets/NewFortressTechnologyLogo-WHT-trans.png'/></td>
								<td className="buttCell" style={{height:60}}><button onClick={this.gohome} className={home}/></td>
							</tr>
						</tbody>
					</table>
			<StealthDynamicView language={lg} onButton={this.onButton} onSens={this.onSens} ref='dv' prodName={this.state.prodRec['ProdName']} sens={[this.state.prodRec['Sens']]} sig={[this.state.peak]} rej={this.state.rej}/>
			<StealthNav language={lg} onButton={this.onButton} ref='nv' prodName={this.state.prodRec['ProdName']}/>
			<Modal ref='testModal'>
					<TestReq mobile={this.props.mobile}  ip={this.props.det.ip} toggle={this.toggleTestModal}/>
				</Modal>
				<Modal ref='pedit'>
				{peditCont}
				</Modal>
				<Modal ref='netpolls'>
					<NetPollView ref='np' eventCount={15} events={this.props.netpoll} ip={this.props.det.ip} mac={this.props.det.mac}/>
				</Modal>
				<Modal ref='configs'>
				</Modal>
			</div>)
	}
}


class StealthDynamicView extends React.Component{
	constructor(props) {
		super(props)
		this.update = this.update.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onSig = this.onSig.bind(this);
		this.onRej = this.onRej.bind(this);
	}
	update (sig) {
		this.refs.tb.update(sig)
	}
	onSens (e) {
		this.props.onSens(e, 'Sens')
	}
	onSig () {
		this.props.onButton('sig')
	}
	onRej () {
		this.props.onButton('rej')
	}
	render () {
			var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'start'}
			var centerLab = {textAlign:'center', marginRight:'auto', marginLeft:'auto', color:"#000"}
		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		return(
			<div style={{marginTop:2}}>
			<div style={{padding:10, borderRadius:20, border:'5px black solid', display:'block', width:940, marginLeft:'auto',marginRight:'auto',background:'rgb(225,225,225)', boxShadow:'0px 0px 0px 10px #818a90'}}>
			<div className='stealthDynamicView'  style={{overflow:'hidden', display:'block', width:940,height:232, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:10, border:'2px solid black'}}>
			<div style={{background:'#818a90', height:232}}>
				<div><TickerBox ref='tb'/></div>
						<table style={{marginLeft:'auto', marginRight:'auto', marginTop:5}}><tbody><tr><td style={{borderColor:'#e1e1e1',borderStyle:'solid',borderWidth:10,borderRadius:20,height:75,background:'#818a90', width:330}}>
						
						<div style={{display:'block', height:34, width:470}}>{vdefMapV2['@labels']['Running Product']['@translations'][this.props.language]['name']}</div>
				<div style={{display:'block', height:34, width:470, fontSize:24}}>{this.props.prodName}</div>

				</td></tr> 
				</tbody></table>
				<div><div style={{display:'inline-block'}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:3, marginBottom:7}}><div style={centerLab} >Sensitivity</div><div ><KeyboardInputButton num={true} isEditable={true} value={this.props.sens[0]} onInput={this.onSens} inverted={false}/></div></div>
				
				</div>
				<div style={{display:'inline-block'}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:3, marginBottom:7}}><div style={centerLab} >Signal</div><div ><KeyboardInputButton onClick={this.onSig} isEditable={false} value={this.props.sig[0]} inverted={false}/></div></div>
				
				</div>
				<div style={{display:'inline-block'}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:3}}><div style={centerLab}>Reject</div><div><KeyboardInputButton  isEditable={false} onClick={this.onRej} value={this.props.rej} inverted={false}/></div></div>
				
				</div></div>

			</div>
			</div>
			</div>
			</div>)
	}
}
class InterceptorDynamicViewDF extends React.Component{
constructor(props) {
		super(props)
		this.state = {peak:0,peaka:0,peakb:0, cipSec:0}
		this.update = this.update.bind(this)
		this.onSens = this.onSens.bind(this)
		this.onSig = this.onSig.bind(this);
		this.onRej = this.onRej.bind(this);
		this.updatePeak = this.updatePeak.bind(this);
		this.setCip = this.setCip.bind(this);
		this.setCipSec = this.setCipSec.bind(this);
		this.onTestReq = this.onTestReq.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	setCip(on){
		
			this.refs.mc.setState({cip:on});
		
	}
	setCipSec(sec){
		
			this.refs.mc.setState({cipSec:sec});
			if(sec != 0){
				if(this.state.cipSec == 0){
					this.setState({cipSec:1})
				}
			}else{
				if(this.state.cipSec == 1){
					this.setState({cipSec:0})
				}
			}
	}
	update (a,b,sig) {
		
		this.refs.tbb.update(sig)
	}
	updatePeak(a,b,df){
		if((this.state.peak != df)){
			this.setState({peak:df})
		}
	}
	onSens (e) {
		this.props.onSens(e, 'Sens')
	}
	onSig () {
		this.props.onButton('sig')
	}
	onRej () {
		this.props.onButton('rej')
	}
	onTestReq(){
		this.props.onButton('onTestReq')
	}
	renderMobile(){
		var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'start'}
		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		var klass = 'interceptorDynamicView'
		var bcolor = 'black';
		var pled = ['#e1e1e1', '#6eed6e', '#ee0000']
		if(this.props.faultArray.length >0){
			if(this.props.faultArray.length > this.props.warningArray.length){

			}else{
				//warning should look different?
			}
			klass = 'interceptorDynamicView_f'
		}else if(this.props.rejOn == 1){
			klass = 'interceptorDynamicView_r'
		}else if(this.props.testReq == 1){
			klass = 'interceptorDynamicView_t'
		}else if(this.props.testReq == 2){
			klass = 'interceptorDynamicView_tf'
		}
		if(this.state.cipSec == 1){
			klass = 'InterceptorDynamicView_tf'
		}
		var marginSt = {marginLeft:5, marginRight:5}
		// accessControl
		var sensacc = (this.props.sys['PassAccSens'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 3);
		var rejacc = (this.props.sys['PassAccClrRej'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 3);
		return (
			<div style={{marginTop:0, marginLeft:7, marginRight:7, marginBottom:12}}>
			<div className={klass} style={{overflow:'hidden', display:'block', marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:20,boxShadow:'0px 0px 0px 8px #818a90'}}>
				<div style={{padding:10, paddingTop:0, paddingBottom:0, display:'block', height:15}}><TickerBox ref='tbb'/>
				</div>
				<div>	<MessageConsole offline={this.props.offline} ref='mc' isUpdating={this.props.isUpdating} isSyncing={this.props.isSyncing} status={this.props.status} clearWarnings={this.props.clearWarnings} clearRejLatch={this.clearRejLatch} testReq={this.props.testReq} 
				toggleTest={this.onTestReq} rejOn={this.props.rejOn} rejLatch={this.props.rejLatch} language={this.props.language} clearFaults={this.props.clearFaults} warningArray={this.props.warningArray} faultArray={this.props.faultArray} prodName={this.props.prodName}/>
</div>
				<div style={marginSt}>
					<KeyboardInputTextButton mobile={true} language={this.props.language} acc={sensacc} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} lab2={' '} num={true} isEditable={true} value={this.props.sens} onInput={this.onSens} onFocus={this.props.onKeyboardOpen} onRequestClose={this.props.onKeyboardClose} inverted={false}/></div>
				<div style={marginSt}><KeyboardInputTextButton mobile={true} language={this.props.language}  acc={rejacc} label={vdefMapV2['@labels']['Rejects'][this.props.language]['name']} isEditable={false} onClick={this.onRej} value={this.props.rej} inverted={false}/></div>
				
				<div style={marginSt}>
					<KeyboardInputTextButton mobile={true} language={this.props.language} overrideBG={true} bgColor={'rgba(200,200,200,1)'} rstyle={{backgroundColor:pled[this.props.pleds]}} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={''} onClick={this.onSig} isEditable={false} value={this.state.peak} inverted={false}/>
				</div>

				
				</div>
				</div>)
	}
	render () {
		if(this.props.mobile){
			return this.renderMobile()
		}
		var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'start'}
		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		var klass = 'interceptorDynamicView'
		var bcolor = 'black';
		var pled = ['#e1e1e1', '#6eed6e', '#ee0000']
		if(this.props.faultArray.length >0){
			if(this.props.faultArray.length > this.props.warningArray.length){

			}else{
				//warning should look different?
			}
			klass = 'interceptorDynamicView_f'
		}else if(this.props.rejOn == 1){
			klass = 'interceptorDynamicView_r'
		}else if(this.props.testReq == 1){
			klass = 'interceptorDynamicView_t'
		}else if(this.props.testReq == 2){
			klass = 'interceptorDynamicView_tf'
		}
		if(this.state.cipSec == 1){
			klass = 'InterceptorDynamicView_tf'
		}
		// accessControl
		var sensacc = (this.props.sys['PassAccSens'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 3);
		var rejacc = (this.props.sys['PassAccClrRej'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 3);
		return (
			<div style={{marginTop:2}}>
			<div className={klass} style={{overflow:'hidden', display:'block', width:956, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:20,boxShadow:'0px 0px 0px 12px #818a90'}}>
				<table  style={{borderSpacing:0,background:'#818a90'}}><tbody>
				<tr>
				<td colSpan={3} style={{padding:0,display:'inline-block',overflow:'hidden', width:956}}>
				<div style={{padding:10, paddingTop:5, paddingBottom:5, display:'block', width:936}}><TickerBox ref='tbb'/>
				</div></td></tr>
				
				<tr>
				<td style={{padding:0, height:123, overflow:'hidden',display:'inline-block'}}>
				<div  style={{display:'inline-block', width:330, height:123}}>
					<div style={{position:'relative', marginTop:5}}>
					<KeyboardInputTextButton language={this.props.language} acc={sensacc} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} lab2={' '} num={true} isEditable={true} value={this.props.sens} onInput={this.onSens} onFocus={this.props.onKeyboardOpen} onRequestClose={this.props.onKeyboardClose} inverted={false}/></div>
				</div>
				</td>
				<td style={{padding:0, height:123, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:280, height:123}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:5, marginLeft:10}}><div><KeyboardInputTextButton language={this.props.language}  acc={rejacc} label={vdefMapV2['@labels']['Rejects'][this.props.language]['name']} isEditable={false} onClick={this.onRej} value={this.props.rej} inverted={false}/></div>
				</div>

				</div>
				</td>
				<td style={{padding:0, height:123, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:330, height:123}}>
					<div style={{position:'relative',marginTop:5}}>
					<KeyboardInputTextButton language={this.props.language} overrideBG={true} bgColor={'rgba(200,200,200,1)'} rstyle={{backgroundColor:pled[this.props.pleds]}} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={''} onClick={this.onSig} isEditable={false} value={this.state.peak} inverted={false}/>
					</div>
					
				</div>
				</td>
				</tr>
				<tr><td colSpan={3} style={{display:'inline-block', padding:0,overflow:'hidden', display:'none'}}><div style={{width:936,height:116, overflow:'hidden', display:'none'}}>
					<MessageConsole offline={this.props.offline} ref='mc' isUpdating={this.props.isUpdating} isSyncing={this.props.isSyncing} status={this.props.status} clearWarnings={this.props.clearWarnings} clearRejLatch={this.clearRejLatch} testReq={this.props.testReq} 
				toggleTest={this.onTestReq} rejOn={this.props.rejOn} rejLatch={this.props.rejLatch} language={this.props.language} clearFaults={this.props.clearFaults} warningArray={this.props.warningArray} faultArray={this.props.faultArray} prodName={this.props.prodName}/>

				</div></td></tr>
				</tbody></table>
				
				</div>
				</div>)
	}
}

class StealthNav extends React.Component{
	constructor(props) {
		super(props)
		this.onConfig = this.onConfig.bind(this);
		this.onTest = this.onTest.bind(this);
		this.onLog = this.onLog.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onProd = this.onProd.bind(this);
		this.streamTo = this.streamTo.bind(this);
	}
	onConfig () {
		this.props.onButton('config')
	}
	onTest () {
		this.props.onButton('test')
	}
	onLog () {
		this.props.onButton('log')
	}
	onSens () {
		this.props.onButton('sens')
	}
	onCal () {
		this.props.onButton('cal')
	}
	onProd () {
		this.props.onButton('prod')
	}
	streamTo (dat) {
		this.refs.sg.stream(dat);
	}
	render () {
		return (<div className='interceptorNav' style={{display:'block', width:930, marginLeft:'auto',marginRight:'auto', background:'black'}}>
				
				<div style={{overflow:'hidden',width:930,height:250}}>
				<table className='intNavTable' style={{height:240, borderSpacing:0, borderCollapse:'collapse'}}><tbody><tr>
				<td>
				<div className='slantedRight'>
					<div style={{background:'#362c66', borderTopRightRadius:'30px 40px', height:240, textAlign:'center'}}>
					<CircularButton lab={'Config'} onClick={this.onConfig}/>
					<CircularButton lab={'Test'} onClick={this.onTest}/>
					<CircularButton lab={'Log'} onClick={this.onLog}/>
					</div>
				</div>
				</td><td>
				<div style={{display:'inline-block', width:430, height:220, borderBottom:'20px solid #818a90',position:'relative', borderBottomLeftRadius:'100px 402px', borderBottomRightRadius:'100px 402px'}}>
						
				
				<StealthNavContent ref='nv' prodName={this.props.prodName}><DummyGraph int={false} ref='sg' canvasId={'sgcanvas2'}/>	</StealthNavContent>
				</div></td><td>
				<div className='slantedLeft'><div style={{background:'#362c66', borderTopLeftRadius:'30px 40px', height:240, textAlign:'center'}}>
				<CircularButton lab={'Sensitivity'} inverted={true} onClick={this.onSens}/>
				<CircularButton lab={'Learn'} inverted={true} onClick={this.onCal}/>
				<CircularButton lab={'Product'} inverted={true} onClick={this.onProd}/>
				</div>	</div></td></tr></tbody></table></div>
			</div>)
	}
}
class StealthNavContent extends React.Component{
	constructor(props) {
		super(props)
		this.state = {prodName:'PRODUCT 1'}
	}
	stream (dat) {
	}
	render () {
		var style = {width:345,height:220,background:'rgb(225,225,225)',marginLeft:'auto',marginRight:'auto'}
		var wrapper = {width:480, height:230, marginTop: -20,marginLeft:-20}
		return (<div className='interceptorNavContent' style={wrapper}>
			<table className='noPadding'>
				<tbody>
				<tr><td>
				{this.props.children}
				
				</td></tr>
				</tbody>
			</table>
				</div>)
	}
}
class IntClock extends React.Component{
	constructor(props){

		super(props)
		this.state = {dt:'1996/01/01 00:00:00', tick:0}
		this.changeDT = this.changeDT.bind(this);
		this.toggleCK = this.toggleCK.bind(this);
		this.setDT = this.setDT.bind(this);
		this.setDST = this.setDST.bind(this);
	}
	setDST(dst){
		this.props.sendPacket('DaylightSavings',dst)
		this.refs.dtsModal.close();
	}
	setDT(dt){
		var self = this;
		this.setState({dt:dt, tick:0})
		setTimeout(function(){
			self.setState({tick:1})
		},1000)
	}
	changeDT(dt){
		this.props.sendPacket('DateTime', dt)
		this.refs.dtsModal.close();
	}
	toggleCK(){
		var self = this;
		//this.refs.ck.toggle()
		this.refs.dtsModal.toggle();
		setTimeout(function(){
			self.refs.dts.getDT(self.state.dt)
		},200)
	}
	render(){
		var dt = this.state.dt;
		if(this.state.tick == 1){
			dt = this.state.dt.slice(0,-1) + (parseInt(this.state.dt.slice(-1))+1).toString();
		}
		return <React.Fragment><label style={{color:'#e1e1e1'}} onClick={this.toggleCK}>{dt}</label>
			<CustomKeyboard num={true} datetime={true} language={this.props.language} tooltip={'Enter Date String in exactly yyyy/mm/dd hh:mm:ss format'} vMap={this.props.vMap}  onFocus={this.onFocus} ref={'ck'} onRequestClose={this.onRequestClose} onChange={this.changeDT} value={this.state.dt} num={false} label={this.state.dt}/>
			<Modal ref='dtsModal'>
				<DateTimeSelect setDST={this.setDST} dst={this.props.dst} language={this.props.language} setDT={this.changeDT} ref='dts'/>
			</Modal>
		</React.Fragment>
	}

}
class InterceptorMainPageUI extends React.Component{
	constructor(props) {
		super(props)
			var res = vdefByMac[this.props.det.mac]
		var pVdef = _pVdef;
		if(res){
			pVdef = res[1];
		} 
		var tmpA = '';
		var tmpB = '';
		var res = null;

		this.state = ({peditMode:false,lang:0,rpeak:0,rpeakb:0,xpeakb:0,xpeak:0, peak:0,peakb:0,phase:0, phaseb:0,rej:0,curInd:0, sysRec:{},prodRec:{}, tmp:'', tmpB:'', 
			prodList:[],prodNames:[], phaseFast:0, phaseFastB:0, pVdef:pVdef, keyboardVisible:false,pled_a:0,pled_b:0, combineMode:0})
		this.keyboardOpen = this.keyboardOpen.bind(this);
		this.keyboardClose = this.keyboardClose.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onButton = this.onButton.bind(this);
		this.clearRej = this.clearRej.bind(this);
		this.switchProd = this.switchProd.bind(this);
		this.clearPeak = this.clearPeak.bind(this);
		this.clearPeakDF = this.clearPeakDF.bind(this);
		this.clearPeakB = this.clearPeakB.bind(this);
		this.sendPacket = this.sendPacket.bind(this);
		this.parseInfo = this.parseInfo.bind(this);
		this.showEditor = this.showEditor.bind(this);
		this.calibrate = this.calibrate.bind(this);
		this.setTest = this.setTest.bind(this);
		this.updateTmp = this.updateTmp.bind(this);
		this.updateTmpB = this.updateTmpB.bind(this);
		this.submitTmpSns = this.submitTmpSns.bind(this);
		this.submitTmpSnsB = this.submitTmpSnsB.bind(this);
		this.refresh = this.refresh.bind(this);
		this.gohome = this.gohome.bind(this);
		this.calA = this.calA.bind(this);
		this.calB = this.calB.bind(this);
		this.setProdList = this.setProdList.bind(this);
		this.getProdName = this.getProdName.bind(this);
		this.prodFocus = this.prodFocus.bind(this);
		this.prodClose = this.prodClose.bind(this);
		this.changeProdEditMode = this.changeProdEditMode.bind(this);
		this.copyCurrentProd = this.copyCurrentProd.bind(this);
		this.deleteProd = this.deleteProd.bind(this);
		this.editName = this.editName.bind(this);
		this.languageChange = this.languageChange.bind(this);	
		this.updatePeak = this.updatePeak.bind(this);
		this.clearSig = this.clearSig.bind(this);
		this.handleProdScroll = this.handleProdScroll.bind(this);
		this.deleteCurrentProd = this.deleteCurrentProd.bind(this);
		this.login = this.login.bind(this);
		this.defaultRestore = this.defaultRestore.bind(this);
		this.deleteAll = this.deleteAll.bind(this);
		this.factoryRestore = this.factoryRestore.bind(this);
		this.factorySave = this.factorySave.bind(this);
		this.importUSB = this.importUSB.bind(this);
		this.exportUSB = this.exportUSB.bind(this);
		this.restorUSB = this.restorUSB.bind(this);
		this.backupUSB = this.backupUSB.bind(this);
		this.clearRejLatch = this.clearRejLatch.bind(this)
		this.cip_plc = this.cip_plc.bind(this);
		this.cip_test = this.cip_test.bind(this);
		this.onDeny = this.onDeny.bind(this);
		this.logout = this.logout.bind(this);
		this.setDT = this.setDT.bind(this);
		this.pauseGraph = this.pauseGraph.bind(this);
		this.restart = this.restart.bind(this);
		this.renderProducts = this.renderProducts.bind(this);
		this.renderProductsMobile = this.renderProductsMobile.bind(this);
	}
	shouldComponentUpdate (nextProps, nextState) {
		if(this.state.keyboardVisible){
			if((this.state.prodRec['Sens_A'] == nextState.prodRec['Sens_A']) &&(this.state.prodRec['Sens_B'] == nextState.prodRec['Sens_B'])){
				return true;
			}else{
				return false;
			}
			
		}else{
			return true;
		}
	}
	pauseGraph(){
	
			this.refs.nv.pauseGraph();
		
	}
	restart(){
		
			this.refs.nv.restart();
	}
	setDT(dt){
		if(!this.props.mobile){

			this.refs.clock.setDT(dt)
		}
	}
	cip_plc(on){
		//if(this.props.df){
		//	this.refs.dv.setCip(on)
		//}else{
			this.refs.nv.setCip(on)
		//}
		
	}
	cip_test(sec){
		//if(this.props.df){
		//	this.refs.dv.setCipSec(sec)
		//}else{
			this.refs.nv.setCipSec(sec)
			this.refs.dv.setCipSec(sec)
		//}
	}
	sendPacket (n,v) {
		this.props.sendPacket(n,v);
	}
	update(siga, sigb,df,ov) {
		var dat = {t:Date.now(),val:siga,valb:sigb, valCom:df}
		this.refs.nv.streamTo(dat,ov)
		this.refs.dv.update(siga,sigb,df)
			this.refs.pedit.updateMeter(siga,sigb,df)
			this.refs.netpolls.updateMeter(siga,sigb,df)
	
	}
	updatePeak(pa,pb,df){
		this.refs.dv.updatePeak(pa,pb,df);
		this.refs.pedit.updateSig(pa,pb,df);
		this.refs.netpolls.updateSig(pa,pb,df)
	}
	componentDidMount(){
		var self = this;
		this.sendPacket('refresh','')
		socket.on('prodNames', function (pack) {
			if(self.props.det.ip == pack.ip){
				self.setState({prodList:pack.list, prodNames:pack.names})
			}
		})
	}
	clearRej () {
		var param = this.state.pVdef[2]['RejCount']
		this.props.clear(param )
	}
	requestSwitchProd(p){

	}
	switchProd (p) {
		var self = this;
		this.props.sendPacket('ProdNo',p)
		setTimeout(function(){
			self.refs.pedit.close();
		},100)
	}
	clearPeakDF(){
		var p = 'Peak'
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
	}
	clearPeak () {
		var p = 'Peak_A'
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
	}
	clearPeakB () {
		var p = 'Peak_B'
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
		param = null;
	}
	calibrate () {
		this.refs.calibModal.toggle()
	}
	parseInfo(sys, prd){
		//if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){

			if(this.props.int){
				//console.log('this should parse it... ')
				this.setState({sysRec:sys, prodRec:prd, tmp:prd['Sens_A'], tmpB:prd['Sens_B']})
			}else{
				this.setState({sysRec:sys, prodRec:prd, tmp:prd['Sens']})
			}
			
		//}
	}
	showEditor () {
		var self = this;
		//7025 this.state.sysRec['PassAccProd'] <= this.props.level
		if((this.state.sysRec['PassAccProd'] <= this.props.level) || (this.state.sysRec['PassOn'] == 0)||(this.props.level > 2)){

			
			this.setState({peditMode:false})
		
			setTimeout(function () {
				//self.setState({peditMode:false})
				self.refs.pedit.toggle()
				socket.emit('getProdList', self.props.det.ip)
			},100)
		}else{
		//	toast('Access Denied')
			setTimeout(function(){
				self.login();
			},)
		}
	}
	editSens () {
		this.refs.sensEdit.toggle()
	}
	setTest () {
		if(typeof this.state.prodRec['TestMode'] != 'undefined'){
			if(this.state.prodRec['TestMode'] != 0){
				this.props.sendPacket('test', this.state.prodRec['TestMode'] - 1)
			}else{
				this.toggleTestModal()
			}
			
		}
	}
	toggleTestModal () {
		// body...
		this.refs.testModal.toggle()
	}
	updateTmp (e) {
		if(typeof e == 'string'){
			if(this.props.int){
				this.props.sendPacket(this.state.pVdef[1]['Sens_A'], e)
			}else{
				this.props.sendPacket(this.state.pVdef[1]['Sens'],e)	
			}
			this.setState({tmp:e})
		}else{
			if(this.props.int){
				this.props.sendPacket(this.state.pVdef[1]['Sens_A'], e.target.value)
			}else{
				this.props.sendPacket(this.state.pVdef[1]['Sens'],e.target.value)	
			}
			this.setState({tmp:e.target.value})	
		}
		
	}
	updateTmpB (e) {
		if(typeof e == 'string'){
			this.props.sendPacket(this.state.pVdef[1]['Sens_B'], e)
			this.setState({tmpB:e})
		}else{
			this.props.sendPacket(this.state.pVdef[1]['Sens_B'], e.target.value)
			this.setState({tmpB:e.target.value})	
		}
		
	}
	submitTmpSns () {
		if(!isNaN(this.state.tmp)){
			if(this.props.int){
				this.props.sendPacket('Sens_A', this.state.tmp)
			}else{
				this.props.sendPacket('Sens',this.state.tmp)	
			}
			this.cancel()
		}
	}
	submitTmpSnsB () {
		if(!isNaN(this.state.tmp)){
			if(this.props.int){
				this.props.sendPacket('Sens_B', this.state.tmpB)
			}else{
				this.props.sendPacket('Sens',this.state.tmpB)	
			}
			this.cancel()
		}
	}
	refresh () {
		this.props.sendPacket('refresh')
	}
	cancel () {
		this.refs.sensEdit.toggle()
		this.setState({tmp:''})
	}
	calB () {
		this.props.sendPacket('cal',[0])
	}
	calA () {
		// body...
		this.props.sendPacket('cal',[1])
	}
	_handleKeyPress (e) {
		if(e.key === 'Enter'){
			this.submitTmpSns();
		}
	}
	sensFocus(){
		this.refs.sensEdit.setState({override:true})
	}
	sensClose(){
		var self = this;
		setTimeout(function(){
			self.refs.sensEdit.setState({override:false})	
		}, 100)
	}
	gohome () {
		// body...
		this.props.gohome();
	}
	toggleNetpoll () {
		// body...
		this.refs.netpolls.toggle();
	}
	onButton (f) {
		// body...
		//////console.log(f)
		var self = this;

		if(f == 'test'){
			setTimeout(function () {
				// body...
				self.props.toggleTestModal();
			},100)
			
		}else if(f == 'onTestReq'){
			setTimeout(function () {
				// body...
				self.props.toggleTestRModal();
			},100)
			
		}else if(f == 'log'){
			setTimeout(function () {
			
				self.toggleNetpoll();
			},100)
			
		}else if(f == 'config'){
			setTimeout(function () {
			
				self.props.toggleConfig();
			},100)
		}else if(f == 'prod'){
			setTimeout(function () {
			
				self.showEditor();
			},100)
			//this.showEditor();
		}else if(f == 'cal'){
			//this.calibrate();
			setTimeout(function () {
			
				self.props.toggleCalib();
			},100)
			//this
		}else if(f=='sig_a'){
			this.clearPeak();
		}else if(f=='sig_b'){
			this.clearPeakB();
		}else if(f=='sig'){
			this.clearPeakDF();
		}else if(f=='rej'){
			this.clearRej();
		}else if(f=='sens'){
			setTimeout(function () {
			
				self.props.toggleSens();
			},100)
		}
	}
	clearRejLatch(){
		//clear rej latch
		this.props.sendPacket('KAPI_REJ_MODE_CLEARLATCH','')
	}
	clearSig(a){
		if(a == 1){
			this.clearPeak()
		}else{
			this.clearPeakB()
		}

	}
	onSens (e,s) {
		this.props.sendPacket(s,e);
	}
	setProdList (prodList) {
		var self = this;
		this.setState({prodList:prodList, curInd:0})
		setTimeout(function () {
			self.getProdName(prodList[0],self.setProdName,0)
			self.handleProdScroll();
		},100)
	}
	getProdName (p,cb,i) {
		this.props.getProdName(p,cb,i)
	}
	setProdName (name, ind) {
		var sa = []
		name.slice(3,23).forEach(function (i) {
			sa.push(i)
		})
		var self = this;
		var str = sa.map(function(ch){
			return String.fromCharCode(ch)
		}).join("").replace("\u0000","").trim();
		var prodNames = this.state.prodNames;
		prodNames[ind] = str
		if(ind + 1 < this.state.prodList.length){
			var i = self.state.prodList[ind+1]
			self.setState({prodNames:prodNames})
			setTimeout(function () {
				self.getProdName(i, self.setProdName, ind+1)
				
			},100)
			
		}else{
			this.setState({prodNames:prodNames})
		}

	}
	prodFocus(){
		this.refs.pedit.setState({override:true})
	}
	prodClose(){
		var self = this;
		this.setState({peditMode:false})
		setTimeout(function(){

			self.refs.pedit.setState({override:false})	
		}, 100)
	}
	changeProdEditMode () {
		// accessControl
		if((this.props.level > 2)||(this.state.sysRec['PassOn'] == 0)){

			this.setState({peditMode:!this.state.peditMode})
		}else{
			toast("Access Denied")
		}
	}
	copyCurrentProd () {
		var nextNum = this.state.prodList[this.state.prodList.length - 1] + 1;
		this.sendPacket('copyCurrentProd', nextNum);
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
			setTimeout(function(){
				self.handleProdScroll();
			},400)
		},100)
	}
	deleteProd (p) {
		this.sendPacket('deleteProd',p)
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	editName (name) {
		this.sendPacket('ProdName',name)
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	factorySave(){
		this.sendPacket('FactorySave')
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}

	factoryRestore(){
		this.sendPacket('FactoryRestore')
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	deleteAll(){
		this.sendPacket('DeleteAll')
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)	
	}
	defaultRestore(){
		this.sendPacket('DefaultRestore')
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	importUSB(){
		socket.emit('import',this.props.det)
		this.refs.pedit.close();
	}
	exportUSB(){
		socket.emit('export', this.props.det)
	}
	backupUSB(){
		socket.emit('backup',this.props.det)
	}
	restorUSB(){
		socket.emit('restore', this.props.det)
		this.refs.pedit.close();
	}
	onCalFocus () {
		this.refs.calibModal.setState({override:true})
	}
	onCalClose () {
		var self = this;
		setTimeout(function () {
				self.refs.calibModal.setState({override:false})
		},100)
	
	}
	keyboardOpen () {
		this.setState({keyboardVisible:true})
	}
	keyboardClose () {
		this.setState({keyboardVisible:false})
	}
	languageChange (i) {
		this.props.setLang(i)
	}
	handleProdScroll(){
		//console.log('handleProdScroll')
		 var el = document.getElementById("prodList")		
     	 if(el){
			if(el.scrollTop > 5){
				this.refs.arrowTop.show();
			}else{
				this.refs.arrowTop.hide();
			}
			if(el.scrollTop + el.offsetHeight < el.scrollHeight ){
				this.refs.arrowBot.show();
			}else{
				this.refs.arrowBot.hide();
			}
    	}
	}
	onDeny(){
		this.login();
	}
	scrollDown(){

	}
	scrollUp(){

	}
	deleteCurrentProd(p){
		if(this.state.prodList.length < 2){
			return;
		}
		//////console.log(['6923',p, this.state.prodList])
		var self  = this;
	
		if(this.state.prodList.indexOf(p) != 0){
			this.switchProd(this.state.prodList[this.state.prodList.indexOf(p) - 1])
		}else{
			this.switchProd(this.state.prodList[1])
		}
		setTimeout(function(){
			self.sendPacket('deleteProd',p)
			setTimeout(function (argument) {
				socket.emit('getProdList', self.props.det.ip)
			},100);
		},200);
	}
	login (){
		this.props.login();
	}
	logout(){
		this.props.logout();
	}
	renderProductsMobile(){
		var self = this;
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']// ['english','korean']
		var lg = lgs[this.props.language]
		var levels = ['Not Logged In', 'Operator', 'Engineer', 'Fortress']
		if(lg == 'turkish'){
		//	lg = 'korean'
		}
		if(vdefMapV2['@languages'].indexOf(lg) == -1){
			lg = 'english'
			//default to english
		}
		var buttonStyle = {display:'inline-block', marginLeft:5, marginRight:5, height: 40,marginBottom:5, lineHeight:'40px', border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:120, borderRadius:20, fontSize:14}

		var prodNames = this.state.prodNames
		var chSize = 8;
		
		var chsize = 3, maxHeight = '80%';
		var defRestore = '', factorySave = '', factoryRestore = '', editCont = '', showPropmt = "#e1e1e1", exportCont='';
		if(this.state.peditMode){
			chsize = 2
			maxHeight = "75%";
			showPropmt = 'orange'
			defRestore =  <CustomAlertButton alertMessage={'Restore this product to default settings?'} onClick={this.defaultRestore}  style={buttonStyle}> Default Restore</CustomAlertButton>
			factorySave = <CustomAlertButton alertMessage={'Save this product to factory?'} onClick={this.factorySave}  style={buttonStyle}>Factory Save</CustomAlertButton>
			factoryRestore = <CustomAlertButton alertMessage={'Restore this product to factory settings?'}  onClick={this.factoryRestore}  style={buttonStyle}>Factory Restore </CustomAlertButton>
			editCont = <div style={{position:'relative', display:'block', width:"100%", marginLeft:'auto',marginRight:'auto', textAlign:'center'}}>
				{factoryRestore}
				{factorySave}
				{defRestore}
				 <CustomAlertButton alertMessage={'Delete all current products?'}  onClick={this.deleteAll}  style={buttonStyle}>Delete All </CustomAlertButton>
			</div>
			/*if(this.props.usb){ 
				maxHeight = "70%";
				exportCont = <div style={{position:'relative', display:'block', height:50, width:"100%", marginTop:5, marginLeft:'auto',marginRight:'auto', textAlign:'center'}}>
				 <CustomAlertButton alertMessage={'Import Product Records from USB?'}  onClick={this.importUSB}  style={buttonStyle}>Import Products</CustomAlertButton>
				 <CustomAlertButton alertMessage={'Export Product Records to USB?'}  onClick={this.exportUSB}  style={buttonStyle}>Export Products</CustomAlertButton>
				 <CustomAlertButton alertMessage={'Restore Product Records from USB?'}  onClick={this.restorUSB}  style={buttonStyle}>Restore Products</CustomAlertButton>
				 <CustomAlertButton alertMessage={'Backup Product Records to USB?'}  onClick={this.backupUSB}  style={buttonStyle}>Backup Products </CustomAlertButton>
			</div>

			}*/
		}
		var chpnames = this.state.prodNames.chunk(chsize);
		var prList = this.state.prodList.map(function(p,i){
			var sel = false
				if(p==self.state.sysRec['ProdNo']){
					sel = true;
				}
				var name = ""
				if(typeof self.state.prodNames[i] != 'undefined'){
					name = self.state.prodNames[i]
				}
				return <div><ProductItem mobile={self.props.mobile} language={lg} onFocus={self.prodFocus} onRequestClose={self.prodClose} selected={sel} p={p} name={name} deleteCurrent={self.deleteCurrentProd} editName={self.editName} editMode={self.state.peditMode} copy={self.copyCurrentProd} delete={self.deleteProd} switchProd={self.switchProd}/></div>
			
		})
		

		var prodList = <div id='prodList' onScroll={this.handleProdScroll} style={{display:'block', width:'100%',marginLeft:'auto',marginRight:'auto', maxHeight:maxHeight, overflowY:'scroll'}}><div>{prList}</div></div>



		
		var SA = false;
		if(this.state.prodList.length > 4*chsize){
			SA = true;
		}

		var gearStyle = {float:'right', display:'block', textAlign:'right', marginLeft:-40}
		var	inblk = 'none'
	
		var togglePedit = <div style={gearStyle}><div style={{top:65}}>
		<div onClick={this.changeProdEditMode} style={{display:inblk, verticalAlign:'top', paddingTop:5, paddingLeft:20, color:showPropmt}}> {vdefMapV2['@labels']['Settings'][lg].name} </div> 
		<div onClick={this.changeProdEditMode} style={{display:'inline-block'}}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPropmt}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg></div></div>
		</div>		
		//bookmark here
		/*
							<h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#eee"}}> {vdefMapV2['@labels']['Products'][lg].name}

				</h2>
				{togglePedit}

		*/
			//Style={{width:450, background:"#362c66"}} innerStyle={{background:'transparent', boxShadow:'none'}}
		return(<div>
				{togglePedit}
				<div style={{paddingTop:10, paddingBottom:4}}>
					 <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5, fontWeight:500, color:"#eee"}} >
					 <div style={{display:'inline-block', textAlign:'center'}}>{vdefMapV2['@labels']['Products'][lg]['name']}</div></h2></span>
					 </div>
				{editCont}
				{exportCont}
				
				<div style={{position:'relative',textAlign:'center', width:"100%", marginLeft:'auto', marginRight:'auto', display:'block'}}>
					<ScrollArrow ref='arrowTop' width={72} marginTop={-35} active={SA} mode={'top'} onClick={this.scrollDown}/>
		
				{prodList}

					<ScrollArrow ref='arrowBot' width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
				</div>
			</div>)
	}
	renderProducts(){
		var self = this;
		if(this.props.mobile){
			return this.renderProductsMobile();
		}
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']// ['english','korean']
		var lg = lgs[this.props.language]
		var levels = ['Not Logged In', 'Operator', 'Engineer', 'Fortress']
		if(lg == 'turkish'){
		//	lg = 'korean'
		}
		if(vdefMapV2['@languages'].indexOf(lg) == -1){
			lg = 'english'
			//default to english
		}

		var prodNames = this.state.prodNames
		var chSize = 8;
		
		var chsize = 3, maxHeight = 380;
		var defRestore = '', factorySave = '', factoryRestore = '', editCont = '', showPropmt = "#e1e1e1", exportCont='';
		if(this.state.peditMode){
			chsize = 2
			maxHeight = 330;
			showPropmt = 'orange'
			defRestore =  <CustomAlertButton alertMessage={'Restore this product to default settings?'} onClick={this.defaultRestore}  style={{display:'inline-block', marginLeft:10, marginRight:10, height: 40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}> Default Restore</CustomAlertButton>
			factorySave = <CustomAlertButton alertMessage={'Save this product to factory?'} onClick={this.factorySave}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Factory Save</CustomAlertButton>
			factoryRestore = <CustomAlertButton alertMessage={'Restore this product to factory settings?'}  onClick={this.factoryRestore}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Factory Restore </CustomAlertButton>
			editCont = <div style={{position:'relative', display:'block', height:50, width:785, marginLeft:'auto',marginRight:'auto', textAlign:'center'}}>
				{factoryRestore}
				{factorySave}
				{defRestore}
				 <CustomAlertButton alertMessage={'Delete all current products?'}  onClick={this.deleteAll}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Delete All </CustomAlertButton>
			</div>
			if(this.props.usb){ 
				maxHeight = 275;
				exportCont = <div style={{position:'relative', display:'block', height:50, width:785, marginTop:5, marginLeft:'auto',marginRight:'auto', textAlign:'center'}}>
				 <CustomAlertButton alertMessage={'Import Product Records from USB?'}  onClick={this.importUSB}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Import Products</CustomAlertButton>
				 <CustomAlertButton alertMessage={'Export Product Records to USB?'}  onClick={this.exportUSB}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Export Products</CustomAlertButton>
				 <CustomAlertButton alertMessage={'Restore Product Records from USB?'}  onClick={this.restorUSB}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Restore Products</CustomAlertButton>
				 <CustomAlertButton alertMessage={'Backup Product Records to USB?'}  onClick={this.backupUSB}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Backup Products </CustomAlertButton>
			</div>

			}
		}
		var chpnames = this.state.prodNames.chunk(chsize);
		var prList = this.state.prodList.chunk(chsize).map(function(a,i){
			var cells = a.map(function(p,j){			
					var sel = false;
				if(p==self.state.sysRec['ProdNo']){
					sel = true;
				}
				var name = ""
				if(typeof chpnames[i][j] != 'undefined'){
					name = chpnames[i][j]
				}
				return <td><ProductItem language={lg} onFocus={self.prodFocus} onRequestClose={self.prodClose} selected={sel} p={p} name={name} deleteCurrent={self.deleteCurrentProd} editName={self.editName} editMode={self.state.peditMode} copy={self.copyCurrentProd} delete={self.deleteProd} switchProd={self.switchProd}/></td>
			})
			return <tr>{cells}</tr>
		})
		

		var prodList = <div id='prodList' onScroll={this.handleProdScroll} style={{display:'block', width:785,marginLeft:'auto',marginRight:'auto', maxHeight:maxHeight, overflowY:'scroll'}}><table><tbody>{prList}</tbody></table></div>


		
		
		var SA = false;
		if(this.state.prodList.length > 4*chsize){
			SA = true;
		}
		var togglePedit =  <div  onClick={this.changeProdEditMode}  style={{top:65}}>
		<div style={{display:'inline-block', verticalAlign:'top',  paddingTop:5, paddingLeft:20, color:showPropmt}}> {vdefMapV2['@labels']['Settings'][lg].name} </div> 
		<div style={{display:'inline-block'}}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPropmt}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg></div></div>
		//bookmark here
		/*
							<h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#eee"}}> {vdefMapV2['@labels']['Products'][lg].name}

				</h2>
				{togglePedit}

		*/
			//Style={{width:450, background:"#362c66"}} innerStyle={{background:'transparent', boxShadow:'none'}}
		return (<div>
				<table style={{width:860, borderBottom:'1px solid #eee', marginBottom:5}}><tbody><tr><td style={{width:200}}></td>
				<td style={{width:460}}><div style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#eee"}}> {vdefMapV2['@labels']['Products'][lg].name}

				</div></td><td style={{width:200, textAlign:'right'}}>{togglePedit}</td></tr></tbody></table>

				{editCont}
				{exportCont}
				
				<div style={{position:'relative',textAlign:'center', width:785, marginLeft:'auto', marginRight:'auto', display:'block'}}>
					<ScrollArrow ref='arrowTop' width={72} marginTop={-35} active={SA} mode={'top'} onClick={this.scrollDown}/>
		
				{prodList}

					<ScrollArrow ref='arrowBot' width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
				</div>
			</div>)


	}
	render () {
		// body...
		var home = 'home'
		var login = 'login'

		var style = {background:'#362c66', width:'100%',display:'block', height:'-webkit-fill-available'}
		if(this.props.mobile){
			style.overflowY = 'scroll'
		}
		var lstyle = {height: 50,marginRight: 10, marginLeft:10, display:'inline-block', marginTop:7}
		var self = this;
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']// ['english','korean']
		var lg = lgs[this.props.language]
		var levels = ['Not Logged In', 'Operator', 'Engineer', 'Fortress']
		if(lg == 'turkish'){
		//	lg = 'korean'
		}
		if(vdefMapV2['@languages'].indexOf(lg) == -1){
			lg = 'english'
			//default to english
		}
	/*	var prodNames = this.state.prodNames
		var chSize = 8;
		
		var chsize = 3, maxHeight = 380;
		var defRestore = '', factorySave = '', factoryRestore = '', editCont = '', showPropmt = "#e1e1e1", exportCont='';
		if(this.state.peditMode){
			chsize = 2
			maxHeight = 330;
			showPropmt = 'orange'
			defRestore =  <CustomAlertButton alertMessage={'Restore this product to default settings?'} onClick={this.defaultRestore}  style={{display:'inline-block', marginLeft:10, marginRight:10, height: 40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}> Default Restore</CustomAlertButton>
			factorySave = <CustomAlertButton alertMessage={'Save this product to factory?'} onClick={this.factorySave}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Factory Save</CustomAlertButton>
			factoryRestore = <CustomAlertButton alertMessage={'Restore this product to factory settings?'}  onClick={this.factoryRestore}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Factory Restore </CustomAlertButton>
			editCont = <div style={{position:'relative', display:'block', height:50, width:785, marginLeft:'auto',marginRight:'auto', textAlign:'center'}}>
				{factoryRestore}
				{factorySave}
				{defRestore}
				 <CustomAlertButton alertMessage={'Delete all current products?'}  onClick={this.deleteAll}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Delete All </CustomAlertButton>
			</div>
			if(this.props.usb){ 
				maxHeight = 275;
				exportCont = <div style={{position:'relative', display:'block', height:50, width:785, marginTop:5, marginLeft:'auto',marginRight:'auto', textAlign:'center'}}>
				 <CustomAlertButton alertMessage={'Import Product Records from USB?'}  onClick={this.importUSB}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Import Products</CustomAlertButton>
				 <CustomAlertButton alertMessage={'Export Product Records to USB?'}  onClick={this.exportUSB}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Export Products</CustomAlertButton>
				 <CustomAlertButton alertMessage={'Restore Product Records from USB?'}  onClick={this.restorUSB}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Restore Products</CustomAlertButton>
				 <CustomAlertButton alertMessage={'Backup Product Records to USB?'}  onClick={this.backupUSB}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Backup Products </CustomAlertButton>
			</div>

			}
		}
		var chpnames = this.state.prodNames.chunk(chsize);
		var prList = this.state.prodList.chunk(chsize).map(function(a,i){
			var cells = a.map(function(p,j){			
					var sel = false;
				if(p==self.state.sysRec['ProdNo']){
					sel = true;
				}
				var name = ""
				if(typeof chpnames[i][j] != 'undefined'){
					name = chpnames[i][j]
				}
				return <td><ProductItem language={lg} onFocus={self.prodFocus} onRequestClose={self.prodClose} selected={sel} p={p} name={name} deleteCurrent={self.deleteCurrentProd} editName={self.editName} editMode={self.state.peditMode} copy={self.copyCurrentProd} delete={self.deleteProd} switchProd={self.switchProd}/></td>
			})
			return <tr>{cells}</tr>
		})
		

		var prodList = <div id='prodList' onScroll={this.handleProdScroll} style={{display:'block', width:785,marginLeft:'auto',marginRight:'auto', maxHeight:maxHeight, overflowY:'scroll'}}><table><tbody>{prList}</tbody></table></div>


		
		var SA = false;
		if(this.state.prodList.length > 4*chsize){
			SA = true;
		}
		var togglePedit =  <div  onClick={this.changeProdEditMode}  style={{top:65}}>
		<div style={{display:'inline-block', verticalAlign:'top',  paddingTop:5, paddingLeft:20, color:showPropmt}}> {vdefMapV2['@labels']['Settings'][lg].name} </div> 
		<div style={{display:'inline-block'}}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPropmt}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg></div></div>
		//bookmark here
		/*
							<h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#eee"}}> {vdefMapV2['@labels']['Products'][lg].name}

				</h2>
				{togglePedit}

		*/
			//Style={{width:450, background:"#362c66"}} innerStyle={{background:'transparent', boxShadow:'none'}}
			var ps = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed_A']]
			var psb = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed_B']]
			if(this.state.phaseFast == 1){
				ps = 'fast'
			}
			if(this.state.phaseFastB == 1){
				psb = 'fast'
			}
		
		var peditCont = this.renderProducts()
		/* (<div>
				<table style={{width:860, borderBottom:'1px solid #eee', marginBottom:5}}><tbody><tr><td style={{width:200}}></td>
				<td style={{width:460}}><div style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#eee"}}> {vdefMapV2['@labels']['Products'][lg].name}

				</div></td><td style={{width:200, textAlign:'right'}}>{togglePedit}</td></tr></tbody></table>

				{editCont}
				{exportCont}
				
				<div style={{position:'relative',textAlign:'center', width:785, marginLeft:'auto', marginRight:'auto', display:'block'}}>
					<ScrollArrow ref='arrowTop' width={72} marginTop={-35} active={SA} mode={'top'} onClick={this.scrollDown}/>
		
				{prodList}

					<ScrollArrow ref='arrowBot' width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
				</div>
			</div>)*/


		var logincell = <td className="logbuttCell" style={{height:60}} onClick={this.login}><button className='login' style={{height:50}} /></td>
		var logintext = ''
		if(this.props.level > 0){
			logincell = <td className="logbuttCell" style={{height:60}} onClick={this.logout}><button className='logout' style={{height:50}} /></td>
			logintext =	<td style={{height:60, width:100, color:'#eee'}}><label onClick={this.login}>{this.props.username}</label></td>
		}

		var dv = (<InterceptorDynamicViewV2 mobile={this.props.mobile} offline={this.props.offline} onDeny={this.onDeny} mac={this.props.mac} testReq={this.props.testReq}  language={lg} onButton={this.onButton} onSens={this.onSens} rejOn={this.props.rejOn} faultArray={this.props.faultArray} warningArray={this.props.warningArray}
							ref='dv' sys={this.state.sysRec} sens={[this.state.prodRec['Sens_A'],this.state.prodRec['Sens_B']]} sig={[this.state.peak,this.state.peakb]} pleds={[this.state.pled_a,this.state.pled_b]} 
										rej={this.state.rej} onKeyboardOpen={this.keyboardOpen} onKeyboardClose={this.keyboardClose} level={this.props.level}/>)
		var dfLab = ''
		if(this.props.df){
			dv = <InterceptorDynamicViewDF mobile={this.props.mobile}  offline={this.props.offline} onDeny={this.onDeny} mac={this.props.mac} testReq={this.props.testReq}  language={lg} onButton={this.onButton} onSens={this.onSens} rejOn={this.props.rejOn} faultArray={this.props.faultArray} warningArray={this.props.warningArray}
							ref='dv' sys={this.state.sysRec} sens={this.state.prodRec['Sens']} sig={this.state.peak} pleds={this.state.pled_a} isSyncing={this.props.isSyncing} isUpdating={this.props.isUpdating} clearRejLatch={this.clearRejLatch}  status={this.props.status} clearFaults={this.props.clearFaults} 
							clearWarnings={this.props.clearWarnings} rejLatch={this.props.rejLatch} prodName={this.state.prodRec['ProdName']}
										rej={this.state.rej} onKeyboardOpen={this.keyboardOpen} onKeyboardClose={this.keyboardClose} level={this.props.level}/>
		
			dfLab = <label style={{fontSize:30,lineHeight:'50px',display:'inline-block',position:'relative',top:-10,color:'#FFF'}}>DF</label>
		}

		return (<div className='interceptorMainPageUI' style={style}>
					<table className='landingMenuTable' style={{marginBottom:-4, marginTop:-7}}>
						<tbody>
							<tr>
								<td style={{width:380}}><img style={lstyle}  src='assets/NewFortressTechnologyLogo-WHT-trans.png'/></td><td hidden={this.props.mobile}>
								<img style={{height:45, marginRight: 10, marginLeft:10, display:'inline-block', marginTop:7}}  src='assets/Interceptor-white-01.svg'/>
								</td>
							{logintext}	{logincell}
							{!this.props.mobile &&
								<td className="buttCell" style={{height:60}}><button onClick={this.gohome} className={home}/></td>
				
							}
							</tr>
						</tbody>
					</table>
		
		{dv}		
		<InterceptorNav mobile={this.props.mobile} offline={this.props.offline} onDeny={this.onDeny} df={this.props.df} testReq={this.props.testReq} isSyncing={this.props.isSyncing} isUpdating={this.props.isUpdating} clearRejLatch={this.clearRejLatch}  status={this.props.status} language={lg} onButton={this.onButton} ref='nv' clearFaults={this.props.clearFaults} clearWarnings={this.props.clearWarnings} 
		rejOn={this.props.rejOn} rejLatch={this.props.rejLatch}  faultArray={this.props.faultArray} warningArray={this.props.warningArray} prodName={this.state.prodRec['ProdName']} combineMode={this.state.prodRec['SigModeCombined']} sens={this.state.prodRec['Sens']} thresh={this.state.prodRec['DetThresh']}>
			<IntClock mobile={this.props.mobile} dst={this.state.sysRec['DaylightSavings']} sendPacket={this.sendPacket} language={lg} ref='clock'/>
		</InterceptorNav>
				<Modal ref='testModal'>
					<TestReq ip={this.props.det.ip} toggle={this.toggleTestModal}/>
				</Modal>
				<Modal mobile={this.props.mobile} ref='pedit' intMeter={true} dfMeter={this.props.df} clear={this.clearSig}>
				

				{peditCont}
				</Modal>
				
				<Modal mobile={this.props.mobile} ref='netpolls' intMeter={true} dfMeter={this.props.df}  clear={this.clearSig}>
					<NetPollView mobile={this.props.mobile} language={lg} ref='np' eventCount={15} events={this.props.netpoll} ip={this.props.det.ip} mac={this.props.det.mac}/>
				</Modal>
				<Modal ref='configs'>
				</Modal>
		</div>)
	}
}
class InterceptorNav extends React.Component{
	constructor(props) {
		super(props)
		this.onConfig = this.onConfig.bind(this);
		this.onTest = this.onTest.bind(this);
		this.onLog = this.onLog.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onCal = this.onCal.bind(this);
		this.onProd = this.onProd.bind(this);
		this.streaTo = this.streamTo.bind(this);
		this.onTestReq = this.onTestReq.bind(this);
		this.clearRejLatch = this.clearRejLatch.bind(this);
		this.setCip = this.setCip.bind(this);
		this.setCipSec = this.setCipSec.bind(this);
		this.onDeny = this.onDeny.bind(this);	
		this.pauseGraph =this.pauseGraph.bind(this);
		this.restart = this.restart.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	pauseGraph(){
		if(this.refs.sg){
			this.refs.sg.pauseGraph();	
		}
		
	}
	restart(){
		if(this.refs.sg){
			this.refs.sg.restart();
		}	
	}
	onDeny(){
		this.props.onDeny();
	}
	setCip(on){
		//if(!this.props.df){
		if(!this.props.mobile){
			this.refs.nv.setState({cip:on});
		}
		//}
	}
	setCipSec(sec){
		if(!this.props.mobile){
			this.refs.nv.setState({cipSec:sec});
		}
	}
	onConfig () {
		this.props.onButton('config')
	}
	onTest () {
		// body...
		this.props.onButton('test')
	}
	onTestReq(){
		this.props.onButton('onTestReq')
	}
	onLog () {
		// body...
		this.props.onButton('log')
	}
	onSens () {
		// body...
		this.props.onButton('sens')
	}
	onCal () {
		// body...
		this.props.onButton('cal')
	}
	onProd () {
		// body...
		this.props.onButton('prod')
	}
	streamTo (dat,ov) {
		// body...

		if(this.refs.sg){
			this.refs.sg.stream(dat,ov);
		}
		
	}
	clearRejLatch(){
		this.props.clearRejLatch();
	}
	renderMobile(){
		var labels = {'Settings':{'english':'Settings','korean':'설정'},
		'Test':{'english':'Test','korean':'테스트'},
		'Log':{'english':'Log','korean':'기록'},
		'Sensitivity':{'english':'Sensitivity','korean':'민감도'},
		'Calibrate':{'english':'Calibrate','korean':'캘리브레이션'},
		'Product':{'english':'Product','korean':'품목'} }
		var klass = 'navWrapper'
		if(this.props.faultArray.length != 0){
			if(this.props.faultArray.length > this.props.warningArray.length){

			}else{
				//warning should look different?
			}
			klass = 'navWrapper_f'
		}else if(this.props.rejOn == 1){
			klass = 'navWrapper_r'
		}else if(this.props.testReq == 1){
			klass = 'navWrapper_t'
		}else if(this.props.testReq == 2){
			klass = 'navWrapper_tf'
		}

		var content = <InterceptorNavContent combineMode={this.props.combineMode} mobile={this.props.mobile} offline={this.props.offline} isSyncing={this.props.isSyncing} isUpdating={this.props.isUpdating} status={this.props.status} clearWarnings={this.props.clearWarnings} clearRejLatch={this.clearRejLatch} testReq={this.props.testReq} 
				toggleTest={this.onTestReq} rejOn={this.props.rejOn} rejLatch={this.props.rejLatch} language={this.props.language} ref='nv' clearFaults={this.props.clearFaults} warningArray={this.props.warningArray} faultArray={this.props.faultArray} prodName={this.props.prodName}/>
				
		//if(this.props.df){
		//	content = <SlimGraph df={true} int={true} ref='sg' canvasId={'sgcanvas2'}/>
		//}

		/*
			<div style={{display:'block', textAlign:'center'}}>
				{this.props.children}
				<div>{content}</div>
				
				
				</div>

		*/
		return (<div className='interceptorNav' style={{display:'block', marginLeft:'auto',marginRight:'auto'}}>
				
				<div className={klass} style={{overflow:'hidden', marginTop:-10, background:'transparent'}}>
				<div style={{background:'#362c66', paddingLeft:15, paddingRight:15}}>
					<CircularButton style={{width:'100%', marginLeft:-8, height:43, borderWidth:5}} lab={vdefMapV2['@labels']['Settings'][this.props.language]['name']} onClick={this.onConfig}/>
					<CircularButton style={{width:'100%', marginLeft:-8, height:43,borderWidth:5, marginTop:3}} lab={vdefMapV2['@labels']['Test'][this.props.language]['name']} onClick={this.onTest}/>
					<CircularButton style={{width:'100%', marginLeft:-8, height:43,borderWidth:5, marginTop:3}} lab={vdefMapV2['@labels']['Log'][this.props.language]['name']} onClick={this.onLog}/>
					<CircularButton style={{width:'100%', marginLeft:-8, height:43,borderWidth:5, marginTop:3}} lab={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} inverted={true} onClick={this.onSens}/>
				<CircularButton style={{width:'100%', marginLeft:-8, height:43,borderWidth:5, marginTop:3}} lab={vdefMapV2['@labels']['Learn'][this.props.language]['name']} inverted={true} onClick={this.onCal}/>
				<CircularButton style={{width:'100%', marginLeft:-8, height:43,borderWidth:5, marginTop:3}} lab={vdefMapV2['@labels']['Product'][this.props.language]['name']} inverted={true} onClick={this.onProd}/>
				
				</div>

				<table hidden className='intNavTable' style={{height:240, marginTop:0, borderSpacing:0,width:'100%', borderCollapse:'collapse', background:'#362c66'}}><tbody><tr>
				<td>
				<div style={{marginLeft:0, marginRight:'auto', width:180}}>
				<div></div>
				</div>
				</td><td>
				<div style={{marginRight:0, marginLeft:'auto', width:180}}><div>
				</div>	</div></td></tr></tbody></table></div>
			</div>)
	}
	render () {
		if(this.props.mobile){
			return this.renderMobile();
		}
		// body...
		var labels = {'Settings':{'english':'Settings','korean':'설정'},
		'Test':{'english':'Test','korean':'테스트'},
		'Log':{'english':'Log','korean':'기록'},
		'Sensitivity':{'english':'Sensitivity','korean':'민감도'},
		'Calibrate':{'english':'Calibrate','korean':'캘리브레이션'},
		'Product':{'english':'Product','korean':'품목'} }
		var left =  {width:215, marginLeft:0, marginRight:'auto', height:80, lineHeight:'85px'}
		var right =  {width:215, marginLeft:'auto', marginRight:0,height:80, lineHeight:'85px'}
		var klass = 'navWrapper'
		if(this.props.faultArray.length != 0){
			if(this.props.faultArray.length > this.props.warningArray.length){

			}else{
				//warning should look different?
			}
			klass = 'navWrapper_f'
		}else if(this.props.rejOn == 1){
			klass = 'navWrapper_r'
		}else if(this.props.testReq == 1){
			klass = 'navWrapper_t'
		}else if(this.props.testReq == 2){
			klass = 'navWrapper_tf'
		}

		var content = 				<InterceptorNavContent offline={this.props.offline} isSyncing={this.props.isSyncing} isUpdating={this.props.isUpdating} status={this.props.status} clearWarnings={this.props.clearWarnings} clearRejLatch={this.clearRejLatch} testReq={this.props.testReq} 
				toggleTest={this.onTestReq} rejOn={this.props.rejOn} rejLatch={this.props.rejLatch} language={this.props.language} ref='nv' clearFaults={this.props.clearFaults} warningArray={this.props.warningArray} faultArray={this.props.faultArray} prodName={this.props.prodName}>
					</InterceptorNavContent>
		//if(this.props.df){
		//	content = <SlimGraph df={true} int={true} ref='sg' canvasId={'sgcanvas2'}/>
		//}
		return (<div className='interceptorNav' style={{display:'block', width:987, marginLeft:'auto',marginRight:'auto', background:'linear-gradient(90deg, transparent, transparent 5%, black 5%, black 95%, transparent 95%)'}}>
				
				<div className={klass} style={{overflow:'hidden',width:987,height:352}}>
				<table className='intNavTable' style={{height:240, borderSpacing:0, borderCollapse:'collapse'}}><tbody><tr>
				<td>
				<div className='slantedRight'>
					<div style={{background:'#362c66', borderTopRightRadius:'30px 50px', height:366, textAlign:'center', marginTop:0, paddingTop:1, position:'relative'}}>
					<CircularButton fSize={35} style={left} lab={vdefMapV2['@labels']['Settings'][this.props.language]['name']} onClick={this.onConfig}/>
					<CircularButton fSize={35} style={left} lab={vdefMapV2['@labels']['Test'][this.props.language]['name']} onClick={this.onTest}/>
					<CircularButton fSize={35} style={left} lab={vdefMapV2['@labels']['Log'][this.props.language]['name']} onClick={this.onLog}/>
					</div>
				</div>
				</td><td>
				<div style={{display:'inline-block', width:480, height:327, borderBottom:'20px solid #818a90',position:'relative', borderBottomLeftRadius:'40px 100px', borderBottomRightRadius:'40px 100px'}}>
				<div style={{height:63}}>{content}</div>
				
				<SlimGraph sens={this.props.sens} thresh={this.props.thresh} combineMode={this.props.combineMode} df={false} int={true} ref='sg' canvasId={'sgcanvas2'}/>
				{this.props.children}
				</div></td><td>
				<div className='slantedLeft'><div style={{background:'#362c66', borderTopLeftRadius:'30px 50px', height:366, textAlign:'center', marginTop:0, paddingTop:1, position:'relative'}}>
				<CircularButton fSize={35} style={right} lab={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} inverted={true} onClick={this.onSens}/>
				<CircularButton fSize={35} style={right} lab={vdefMapV2['@labels']['Learn'][this.props.language]['name']} inverted={true} onClick={this.onCal}/>
				<CircularButton fSize={35} style={right} lab={vdefMapV2['@labels']['Product'][this.props.language]['name']} inverted={true} onClick={this.onProd}/>
				</div>	</div></td></tr></tbody></table></div>
			</div>)
	}
}
class MessageConsole extends React.Component{
	constructor(props){
		super(props)
		this.state =  {prodName:'PRODUCT 1',cip:0,cipSec:0}
		this.clearFaults = this.clearFaults.bind(this);
		this.clearRejLatch = this.clearRejLatch.bind(this);
		this.clearWarnings = this.clearWarnings.bind(this);
		this.renderOverlay = this.renderOverlay.bind(this);
		this.onClick = this.onClick.bind(this);
	}
	clearWarnings(){
		this.props.clearWarnings();
	}
	clearFaults(){
		this.props.clearFaults();
	}
	clearRejLatch(){
		this.props.clearRejLatch();
	}
	onClick(){
		if(this.props.faultArray.length>0){
			this.refs.fModal.toggle();
		}else if(this.props.testReq != 0){
			this.props.toggleTest();
		}else if(this.props.rejLatch ==1){
			this.refs.fModal.toggle();
		}
	}
	renderOverlay(){
		var self = this;
		var fActive = (this.props.faultArray.length > 0)
		var left = 'dfnavTabLeft'
		var center = 'dfnavTabCent'
		var right = 'dfnavTabRight'
		var fCont = <div style={{color:"#e1e1e1"}}>{vdefMapV2['@labels']["No Faults"][this.props.language].name}</div>
		var bgColor = 'rgba(150,150,150,0.3)'
		var style = {width:345,height:220,background:'rgb(225,225,225)',marginLeft:'auto',marginRight:'auto'}
		var wrapper = {width:'100%', height:88, marginLeft:'auto', marginRight:'auto', marginTop:10}
		var line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Running Product'][this.props.language]['name']}</div>
		var line2 = 	<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{this.props.prodName}</div>
		var textColor = '#eee'
		if(fActive){
			var fref = 'Faults'
			var wref = 'Warnings'
			var fstr = this.props.faultArray.length + " " +vdefMapV2['@labels'][fref][this.props.language].name
			var wstr = ''
			if(this.props.warningArray.length > 0){
				var faultCount = this.props.faultArray.length - this.props.warningArray.length;
				if(faultCount == 0){
					fstr = this.props.warningArray.length + " " +vdefMapV2['@labels'][wref][this.props.language].name
				}else{

					if(faultCount == 1){
						fref = 'Fault'
					}
					if(this.props.warningArray.length == 1){
						wref = 'Warning'
					}
					fstr = faultCount + " " + vdefMapV2['@labels'][fref][this.props.language].name; 
					wstr =  this.props.warningArray.length + " " +vdefMapV2['@labels'][wref][this.props.language].name
				}
			}
			if(this.props.faultArray.length == 1){
				fstr = vdefMapV2['@vMap'][this.props.faultArray[0]+'Mask']['@translations'][this.props.language]['name'];
				if(this.props.warningArray.length == 1){
					var fArr = fstr.split(' ').slice(0,-1);
					fArr.push(vdefMapV2['@labels']["Warning"][this.props.language].name)
					fstr = fArr.join(' ');
				}
			}
			line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{fstr}</div>
			line2 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{wstr}</div>	//<div style={{display:'block', height:34, width:330, fontSize:25}}><button hidden onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button></div>
			bgColor = 'yellow'
			left = 'dfnavTabLeft_f'
			center = 'dfnavTabCent_f'
			right = 'dfnavTabRight_f'
			var clrButtons = ''
			if(this.props.warningArray.length == this.props.faultArray.length){
					clrButtons =  <button onClick={this.clearWarnings}>{vdefMapV2['@labels']['Clear Warnings'][this.props.language]['name']}</button>
				}else if(this.props.warningArray.length != 0){
						clrButtons =  <React.Fragment><button onClick={this.clearWarnings}>{vdefMapV2['@labels']['Clear Warnings'][this.props.language]['name']}</button>
											 <button onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button>
						</React.Fragment>
				}else{
					clrButtons =  <button onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button>
				
				}
			fCont = <div style={{color:"#e1e1e1"}}>{this.props.faultArray.map(function (f) {
				if(self.props.warningArray.indexOf(f) != -1){
					return <div>{vdefMapV2['@vMap'][f+'Mask']['@translations'][self.props.language]['name']+ ' - '+ vdefMapV2['@labels']["Warning"][self.props.language].name}</div>
				}
				return  <div>{vdefMapV2['@vMap'][f+'Mask']['@translations'][self.props.language]['name']}</div>
			})}{clrButtons}</div>
		}else if(this.props.rejOn == 1){
			textColor = '#333'
			left = 'dfnavTabLeft_r'
			center = 'dfnavTabCent_r'
			right = 'dfnavTabRight_r'
			if(this.props.rejLatch == 1){
				fCont = <div style={{color:"#e1e1e1"}}><button onClick={this.clearRejLatch}>{vdefMapV2['@labels']['Clear Reject Latch'][this.props.language].name}</button></div>
				line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Reject Latched'][this.props.language]['name']}</div>
				line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{vdefMapV2['@labels']['Clear Latch'][this.props.language]['name']}</div>
			}
		}else if(this.props.testReq == 1){
			left = 'dfnavTabLeft_t'
			center = 'dfnavTabCent_t'
			right = 'dfnavTabRight_t'
			line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Test in progress'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{this.props.status}</div>
		}else if(this.props.testReq == 2){
			left = 'dfnavTabLeft_tf'
			center = 'dfnavTabCent_tf'
			right = 'dfnavTabRight_tf'
			line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Test required'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{this.props.status}</div>
		}

		if(this.props.isSyncing){
			line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Syncing'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}
		if(this.state.cipSec){
			left = 'dfnavTabLeft_tf'
			center = 'dfnavTabCent_tf'
			right = 'dfnavTabRight_tf'
			line1 =  <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Clean mode'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{vdefMapV2['@labels']['Time left'][this.props.language].name + ': '+ this.state.cipSec}</div>

		}
		if(this.state.cip){
			line1 =  <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Clean mode'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>PLC</div>

		}

		if(this.props.isUpdating){
			line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Updating Detector'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}else if(this.props.offline){
			line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Trying to reconnect'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>

		}
		return (<div className='interceptorNavContent' style={wrapper}>
			<div style={{paddingTop:0, color:textColor}}>
			<div className='noPadding' onClick={this.onClick}>
				<div className={center}>
				{line1}{line2}
				</div>
			</div>
			</div>
			<div>
			{this.props.children}
			</div>
			<Modal ref='fModal'>
				{fCont}
			</Modal>
				</div>)
			
	}
	render() {
		return this.renderOverlay();	
	}
}
class InterceptorNavContent extends React.Component{
	constructor(props) {
		super(props)
		this.state =  {prodName:'PRODUCT 1',cip:0,cipSec:0}
		this.clearFaults = this.clearFaults.bind(this);
		this.clearRejLatch = this.clearRejLatch.bind(this);
		this.clearWarnings = this.clearWarnings.bind(this);
		this.onClick = this.onClick.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	stream (dat,ov) {
	}
	componentWillReceiveProps(newProps){
		if(newProps.faultArray.length > this.props.faultArray.length){
			this.refs.fModal.show();
		}
	}
	clearFaults(){
		this.props.clearFaults()
	}
	clearWarnings(){
		this.props.clearWarnings()
	}
	clearRejLatch(){
		this.props.clearRejLatch()
	}
	onClick () {
		if(this.props.faultArray.length>0){
			this.refs.fModal.toggle();
		}else if(this.props.testReq != 0){
			this.props.toggleTest();
		}else if(this.props.rejLatch ==1){
			this.refs.fModal.toggle();
		}
	}
	renderMobile(){
		var self = this;
		var fActive = (this.props.faultArray.length > 0)
		var left = 'navTabLeft'
		var center = 'navTabCent'
		var right = 'navTabRight'
		var fCont = <div style={{color:"#e1e1e1"}}>{vdefMapV2['@labels']["No Faults"][this.props.language].name}</div>
		var bgColor = 'rgba(150,150,150,0.3)'
		var style = {width:345,height:220,background:'rgb(225,225,225)',marginLeft:'auto',marginRight:'auto'}
		var wrapper = {width:'100%'}
		var line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Running Product'][this.props.language]['name']}</div>
		var line2 = 	<div style={{display:'block', height:34, width:270, fontSize:25}}>{this.props.prodName}</div>
		if(fActive){
			var fref = 'Faults'
			var wref = 'Warnings'
			var fstr = this.props.faultArray.length + " " +vdefMapV2['@labels'][fref][this.props.language].name
			var wstr = ''
			if(this.props.warningArray.length > 0){
				var faultCount = this.props.faultArray.length - this.props.warningArray.length;
				if(faultCount == 0){
					fstr = this.props.warningArray.length + " " +vdefMapV2['@labels'][wref][this.props.language].name
				}else{

					if(faultCount == 1){
						fref = 'Fault'
					}
					if(this.props.warningArray.length == 1){
						wref = 'Warning'
					}
					fstr = faultCount + " " + vdefMapV2['@labels'][fref][this.props.language].name; 
					wstr =  this.props.warningArray.length + " " +vdefMapV2['@labels'][wref][this.props.language].name
				}
			}
			if(this.props.faultArray.length == 1){
				fstr = vdefMapV2['@vMap'][this.props.faultArray[0]+'Mask']['@translations'][this.props.language]['name'];
				if(this.props.warningArray.length == 1){
					var fArr = fstr.split(' ').slice(0,-1);
					fArr.push(vdefMapV2['@labels']["Warning"][this.props.language].name)
					fstr = fArr.join(' ');
				}
			}
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{fstr + " " + wstr}</div>
			//line2 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{wstr}</div>	//<div style={{display:'block', height:34, width:330, fontSize:25}}><button hidden onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button></div>
			bgColor = 'yellow'
			left = 'navTabLeft_f'
			center = 'navTabCent_f'
			right = 'navTabRight_f'
			var clrButtons = ''
			if(this.props.warningArray.length == this.props.faultArray.length){
					clrButtons =  <button onClick={this.clearWarnings}>{vdefMapV2['@labels']['Clear Warnings'][this.props.language]['name']}</button>
				}else if(this.props.warningArray.length != 0){
						clrButtons =  <React.Fragment><button onClick={this.clearWarnings}>{vdefMapV2['@labels']['Clear Warnings'][this.props.language]['name']}</button>
											 <button onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button>
						</React.Fragment>
				}else{
					clrButtons =  <button onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button>
				
				}
			fCont = <div style={{color:"#e1e1e1"}}>{this.props.faultArray.map(function (f) {
				if(self.props.warningArray.indexOf(f) != -1){
					return <div>{vdefMapV2['@vMap'][f+'Mask']['@translations'][self.props.language]['name']+ ' - '+ vdefMapV2['@labels']["Warning"][self.props.language].name}</div>
				}
				return  <div>{vdefMapV2['@vMap'][f+'Mask']['@translations'][self.props.language]['name']}</div>
			})}{clrButtons}</div>
		}else if(this.props.rejOn == 1){
			left = 'navTabLeft_r'
			center = 'navTabCent_r'
			right = 'navTabRight_r'
			if(this.props.rejLatch == 1){
				fCont = <div style={{color:"#e1e1e1"}}><button onClick={this.clearRejLatch}>{vdefMapV2['@labels']['Clear Reject Latch'][this.props.language].name}</button></div>
				line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Reject Latched'][this.props.language]['name'] + ' - ' + vdefMapV2['@labels']['Clear Latch'][this.props.language]['name']}</div>
				//line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{}</div>
			}
		}else if(this.props.testReq == 1){
			left = 'navTabLeft_t'
			center = 'navTabCent_t'
			right = 'navTabRight_t'
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Test in progress'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:270, fontSize:25}}>{this.props.status}</div>
		}else if(this.props.testReq == 2){
			left = 'navTabLeft_tf'
			center = 'navTabCent_tf'
			right = 'navTabRight_tf'
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Test required'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:270, fontSize:25}}>{this.props.status}</div>
		}
		if(this.props.isUpdating){
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Updating Detector'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:270, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}
		if(this.props.isSyncing){
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Syncing'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:270, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}
		if(this.state.cipSec){
			line1 =  <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Clean mode'][this.props.language].name + ' - ' + vdefMapV2['@labels']['Time left'][this.props.language].name + ': '+ this.state.cipSec}</div>
			//line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{}</div>

		}
		if(this.state.cip){
			line1 =  <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Clean mode'][this.props.language].name}</div>
		//	line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>PLC</div>

		}
		if(this.props.isUpdating){
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Updating Detector'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:270, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}else if(this.props.offline){
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Trying to reconnect'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:270, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
	
		}
		return (<div className='interceptorNavContent' style={wrapper}>
			<div style={{   textAlign:'center', color:'#eee'}}>
			<div style={{display:'block', width:350, marginLeft:'auto',marginRight:'auto'}}>
			<table className='noPadding' style={{marginRight:0, marginLeft:0}} onClick={this.onClick}>
				<tbody><tr><td className={left} ></td>
				<td className={center} style={{width:270}}>
				{line1}{line2}
				</td><td className={right}></td></tr>
				</tbody>
			</table>
			</div>
			</div>
			<div>
			{this.props.children}
			</div>
			<Modal ref='fModal'>
				{fCont}
			</Modal>
				</div>)
	}
	render () {
		if(this.props.mobile){
			return this.renderMobile()
		}
		var self = this;
		var fActive = (this.props.faultArray.length > 0)
		var left = 'navTabLeft'
		var center = 'navTabCent'
		var right = 'navTabRight'
		var fCont = <div style={{color:"#e1e1e1"}}>{vdefMapV2['@labels']["No Faults"][this.props.language].name}</div>
		var bgColor = 'rgba(150,150,150,0.3)'
		var style = {width:345,height:220,background:'rgb(225,225,225)',marginLeft:'auto',marginRight:'auto'}
		var wrapper = {width:480, height:220}
		var line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Running Product'][this.props.language]['name']}</div>
		var line2 = 	<div style={{display:'block', height:34, width:330, fontSize:25}}>{this.props.prodName}</div>
		if(fActive){
			var fref = 'Faults'
			var wref = 'Warnings'
			var fstr = this.props.faultArray.length + " " +vdefMapV2['@labels'][fref][this.props.language].name
			var wstr = ''
			if(this.props.warningArray.length > 0){
				var faultCount = this.props.faultArray.length - this.props.warningArray.length;
				if(faultCount == 0){
					fstr = this.props.warningArray.length + " " +vdefMapV2['@labels'][wref][this.props.language].name
				}else{

					if(faultCount == 1){
						fref = 'Fault'
					}
					if(this.props.warningArray.length == 1){
						wref = 'Warning'
					}
					fstr = faultCount + " " + vdefMapV2['@labels'][fref][this.props.language].name; 
					wstr =  this.props.warningArray.length + " " +vdefMapV2['@labels'][wref][this.props.language].name
				}
			}
			if(this.props.faultArray.length == 1){
				fstr = vdefMapV2['@vMap'][this.props.faultArray[0]+'Mask']['@translations'][this.props.language]['name'];
				if(this.props.warningArray.length == 1){
					var fArr = fstr.split(' ').slice(0,-1);
					fArr.push(vdefMapV2['@labels']["Warning"][this.props.language].name)
					fstr = fArr.join(' ');
				}
			}
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{fstr + " " + wstr}</div>
			//line2 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{wstr}</div>	//<div style={{display:'block', height:34, width:330, fontSize:25}}><button hidden onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button></div>
			bgColor = 'yellow'
			left = 'navTabLeft_f'
			center = 'navTabCent_f'
			right = 'navTabRight_f'
			var clrButtons = ''
			if(this.props.warningArray.length == this.props.faultArray.length){
					clrButtons =  <button onClick={this.clearWarnings}>{vdefMapV2['@labels']['Clear Warnings'][this.props.language]['name']}</button>
				}else if(this.props.warningArray.length != 0){
						clrButtons =  <React.Fragment><button onClick={this.clearWarnings}>{vdefMapV2['@labels']['Clear Warnings'][this.props.language]['name']}</button>
											 <button onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button>
						</React.Fragment>
				}else{
					clrButtons =  <button onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button>
				
				}
			fCont = <div style={{color:"#e1e1e1"}}>{this.props.faultArray.map(function (f) {
				if(self.props.warningArray.indexOf(f) != -1){
					return <div>{vdefMapV2['@vMap'][f+'Mask']['@translations'][self.props.language]['name']+ ' - '+ vdefMapV2['@labels']["Warning"][self.props.language].name}</div>
				}
				return  <div>{vdefMapV2['@vMap'][f+'Mask']['@translations'][self.props.language]['name']}</div>
			})}{clrButtons}</div>
		}else if(this.props.rejOn == 1){
			left = 'navTabLeft_r'
			center = 'navTabCent_r'
			right = 'navTabRight_r'
			if(this.props.rejLatch == 1){
				fCont = <div style={{color:"#e1e1e1"}}><button onClick={this.clearRejLatch}>{vdefMapV2['@labels']['Clear Reject Latch'][this.props.language].name}</button></div>
				line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Reject Latched'][this.props.language]['name'] + ' - ' + vdefMapV2['@labels']['Clear Latch'][this.props.language]['name']}</div>
				//line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{}</div>
			}
		}else if(this.props.testReq == 1){
			left = 'navTabLeft_t'
			center = 'navTabCent_t'
			right = 'navTabRight_t'
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Test in progress'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{this.props.status}</div>
		}else if(this.props.testReq == 2){
			left = 'navTabLeft_tf'
			center = 'navTabCent_tf'
			right = 'navTabRight_tf'
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Test required'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{this.props.status}</div>
		}
		if(this.props.isUpdating){
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Updating Detector'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}
		if(this.props.isSyncing){
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Syncing'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}
		if(this.state.cipSec){
			line1 =  <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Clean mode'][this.props.language].name + ' - ' + vdefMapV2['@labels']['Time left'][this.props.language].name + ': '+ this.state.cipSec}</div>
			//line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{}</div>

		}
		if(this.state.cip){
			line1 =  <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Clean mode'][this.props.language].name}</div>
		//	line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>PLC</div>

		}
		if(this.props.isUpdating){
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Updating Detector'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}else if(this.props.offline){
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Trying to reconnect'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
	
		}
		return (<div className='interceptorNavContent' style={wrapper}>
			<div style={{   position: 'fixed',marginTop: -15,marginLeft: 35, color:'#eee'}}>
			<table className='noPadding' onClick={this.onClick}>
				<tbody><tr><td className={left} ></td>
				<td className={center}>
				{line1}{line2}
				</td><td className={right}></td></tr>
				</tbody>
			</table>
			</div>
			<div>
			{this.props.children}
			</div>
			<Modal ref='fModal'>
				{fCont}
			</Modal>
				</div>)
			
	}
}
class InterceptorDynamicViewV2 extends React.Component{
	constructor(props) {
		super(props)
		this.state = {peaka:0,peakb:0, cipSec:0}
		this.update = this.update.bind(this)
		this.onSens = this.onSens.bind(this)
		this.onSensB = this.onSensB.bind(this);
		this.onSigA = this.onSigA.bind(this);
		this.onSigB = this.onSigB.bind(this);
		this.onRej = this.onRej.bind(this);
		this.onDeny = this.onDeny.bind(this);
		this.updatePeak = this.updatePeak.bind(this);
	}
	setCipSec(sec){
		if(sec != 0){
				if(this.state.cipSec == 0){
					this.setState({cipSec:1})
				}
			}else{
				if(this.state.cipSec == 1){
					this.setState({cipSec:0})
				}
			}
	}
	update (siga, sigb) {
		this.refs.tba.update(siga)
		this.refs.tbb.update(sigb)
	}
	updatePeak(a,b){
		if((this.state.peaka != a)||(this.state.peakb != b)){
			this.setState({peaka:a, peakb:b})
		}
	}
	onSens (e) {
		this.props.onSens(e, 'Sens_A')
	}
	onSensB(e){
		this.props.onSens(e, 'Sens_B')
	}
	onSigA () {
		this.props.onButton('sig_a')
	}
	onSigB () {
		this.props.onButton('sig_b')
	}
	onRej () {
		this.props.onButton('rej')
	}
	onDeny(){
		this.props.onDeny()
	}
	render () {
		var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'start'}
		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		var klass = 'interceptorDynamicView'
		var bcolor = 'black';
		var pled = ['#e1e1e1', '#6eed6e', '#ee0000']
		if(this.props.faultArray.length >0){
			if(this.props.faultArray.length > this.props.warningArray.length){

			}else{
				//warning should look different?
			}
			klass = 'interceptorDynamicView_f'
		}else if(this.props.rejOn == 1){
			klass = 'interceptorDynamicView_r'
		}else if(this.props.testReq == 1){
			klass = 'interceptorDynamicView_t'
		}else if(this.props.testReq == 2){
			klass = 'interceptorDynamicView_tf'
		}
		if(this.state.cipSec == 1){
			klass = 'interceptorDynamicView_tf'
		}
		// accessControl
		var sensacc = (this.props.sys['PassAccSens'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 2); //	(vdefByMac[this.props.mac][7]['SensEdit'].indexOf(0) != -1) || (vdefByMac[this.props.mac][7]['SensEdit'].indexOf(this.props.level) != -1)||(this.props.level > 2)
		var rejacc = (this.props.sys['PassAccClrRej'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 2);
		return (
			<div style={{marginTop:2}}>
			<div className={klass} style={{overflow:'hidden', display:'block', width:956, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:20,boxShadow:'0px 0px 0px 12px #818a90'}}>
				<table  style={{borderSpacing:0,background:'linear-gradient(55deg,#818a90, #818a90 49.9%, #362c66 50.1%, #362c66)'}}><tbody>
				<tr><td style={{display:'inline-block', padding:0,width:336,overflow:'hidden'}}><div style={{width:356,height:26}}></div></td>
				<td colSpan={2} style={{padding:0,display:'inline-block',overflow:'hidden', width:615}}>
				<div style={{paddingRight:10, paddingTop:5, paddingBottom:5, display:'block', width:511,marginLeft:70,paddingLeft:20}}><TickerBox ref='tbb'/>
				</div></td></tr>
				
				<tr>
				<td style={{padding:0, height:180, overflow:'hidden',display:'inline-block'}}>
				<div  style={{display:'inline-block', width:330, height:180}}>
					<label style={{float:'left',fontSize:28,marginTop:56, marginLeft:10,marginRight:-34}}>A</label>
					<div style={{position:'relative', marginTop:0, marginBottom:-7}}>
					<KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language} acc={sensacc} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} lab2={' A'} num={true} isEditable={false} value={this.props.sens[0]} onClick={() => this.props.onButton('sens')} onInput={this.onSens} onFocus={this.props.onKeyboardOpen} onRequestClose={this.props.onKeyboardClose} inverted={false}/></div>
				
					<div style={{position:'relative',marginBottom:7}}><KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language} overrideBG={true} rstyle={{backgroundColor:pled[this.props.pleds[0]]}} bgColor={'rgba(200,200,200,1)'} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={' A'} onClick={this.onSigA} isEditable={false} value={this.state.peaka} inverted={false}/></div>
					
				</div>
				</td>
				<td style={{padding:0, height:180, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:280, height:180}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:48}}><div><KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language}  acc={rejacc} label={vdefMapV2['@labels']['Rejects'][this.props.language]['name']} isEditable={false} onClick={this.onRej} value={this.props.rej} inverted={false}/></div>
				</div>

				</div>
				</td>
				<td style={{padding:0, height:180, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:330, height:180}}>
					<label style={{float:'right',fontSize:28,color:"#e1e1e1", marginTop:56, marginLeft:-34, marginRight:10}}>B</label>
					<div style={{position:'relative', marginTop:0, marginBottom:-7}}><KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language}  acc={sensacc} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} lab2={' B'} onFocus={this.props.onKeyboardOpen} onRequestClose={this.props.onKeyboardClose} num={true} onClick={() => this.props.onButton('sens')} isEditable={false} value={this.props.sens[1]} onInput={this.onSensB} inverted={true}/></div>
					<div style={{position:'relative',marginBottom:7}}><KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language} overrideBG={true} bgColor={'rgba(200,200,200,1)'} rstyle={{backgroundColor:pled[this.props.pleds[1]]}} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={' B'} onClick={this.onSigB} isEditable={false} value={this.state.peakb} inverted={true}/></div>
					
				</div>
				</td>
				</tr>
				<tr><td colSpan={2} style={{padding:0,display:'inline-block',overflow:'hidden', width:615}}><div style={{paddingLeft:10, paddingTop:5, paddingBottom:5, display:'block', width:511,marginLeft:-7,paddingLeft:20}}><TickerBox ref='tba'/></div></td><td style={{display:'inline-block', padding:0,width:336,overflow:'hidden'}}><div style={{width:356,height:26}}></div></td></tr>
				</tbody></table>
				
				</div>
				</div>)
	}
}


class ButtonWrapper extends React.Component{
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this);
	}
	onClick () {
		// body...
		this.props.onClick(this.props.ID)
	}
	render () {
		// body...
		var style = this.props.style || {}
		return <button onClick={this.onClick} style={style}>{this.props.children}</button>
	}
}
class CircularButton extends React.Component{
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this)
	}
	onClick () {
		if(!this.props.disabled){
			this.props.onClick();
		}else{
			toast('Test is not configured')
		}
	}
	render () {
		var bg = '#818a90'
		var gr = '#484074'
		var mr = 'auto'
		var ml = 'auto'
		var border = '8px solid rgb(129, 138, 144)'
		 
		if(this.props.isTransparent){
			ml = 'auto'
			if(this.props.inverted){
				gr = '#484074'

			}else{
				gr = '#484074'
			}
		}
		
		var style = {height:55,top:-6,left:-6}
		var divstyle = {overflow:'hidden',background:bg,height:50,width:50,borderRadius:25}
		var bstyle = Object.assign({} ,this.props.style)
		var fsize = 30;
		if(this.props.lab.length > 12){
			fsize = 24;
		}
		if(this.props.fSize){
			fsize = this.props.fSize
		}
		var innerStyle = {display:'inline-block', position:'relative',top:-2,width:'100%', color:"#e1e1e1", fontSize:fsize,lineHeight:'50px'}
		if(this.props.innerStyle){
			innerStyle = Object.assign({} ,this.props.innerStyle);
		}
		if(this.props.selected == true){
			bstyle.background = 'rgb(128,122,150)'
		}
		if(this.props.disabled){
			bstyle.background = '#818a90'
			innerStyle.color = "#bbb"
			return(<div  className='circularButton' onClick={this.onClick} style={bstyle}>
				<div style={innerStyle}>{this.props.lab}</div>
			</div>)
		}	

		if(this.props.inverted){
			return(<div  className='circularButton' onClick={this.onClick} style={bstyle}>
				<div style={innerStyle}>{this.props.lab}</div>
			</div>)
		}else{
			return(<div className='circularButton' onClick={this.onClick} style={bstyle}>
				<div style={innerStyle}>{this.props.lab}</div>
			</div>)
		}
	}
}
class KeyboardInputButton extends React.Component{
	constructor(props) {
		super(props)
		this.editValue = this.editValue.bind(this)
		this.onInput = this.onInput.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
	}
	onInput (e) {
		// body...
		this.props.onInput(e)
	}
	onFocus () {
		// body...
		if(this.props.onFocus){
			this.props.onFocus()
		}
	}
	onRequestClose () {
		// body...
		if(this.props.onRequestClose){
			this.props.onRequestClose();
		}
	}
	editValue () {
		// body...
		var self = this;
		if(this.props.isEditable){
			setTimeout(function () {
				// body...
				self.refs.input.toggle()
			},100)
			
		}else{
			this.props.onClick()
		}
		
	}
	render () {
		// body...

		var bgColor='rgba(200,200,200,1)'
		var rstyle = {}
	
		if(this.props.overrideBG){
			bgColor = this.props.bgColor
			rstyle = this.props.rstyle || {}
		}
		var boxShadow = '0px 0px 0px 50px '+bgColor
		var ckb = <CustomKeyboard language={this.props.language} ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.value}/>
		
		var	kb = <label style={{fontSize:25, textAlign:'center', width:100, display:'inline-block', lineHeight:2}} onClick={this.editValue}>{this.props.value}</label>
		
		if(this.props.inverted){
		var before = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:44,left:0,backgroundColor:bgColor,borderRadius:30, height:50}
		var after = {position:'absolute',height:'100%',display:'inline-block',top:0,width:44,left:126,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:50, height:50}
		var contStyle= {display:'inline-block',width:100,position:'absolute',left:20,overflow:'hidden', height:50, backgroundColor:bgColor, zIndex:2}
   		return(<div className='keyboardInputButton' >
			<div className='round-bg' style={rstyle}>

				<div className='pbContain' style={{left:10}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
				<div className='pbDiv' style={{position:'relative', paddingRight:5}}>
				<button className='playButtonInv' onClick={this.editValue}/>
				</div>
				</div>
				{ckb}
				</div>)
		}else{


		var after = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:44,left:94,backgroundColor:bgColor,borderRadius:30, height:50}
		var before = {position:'absolute',height:'100%',display:'inline-block',top:0,width:44,left:-32,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:30, height:50}
		var contStyle= {display:'inline-block',width:100,position:'absolute',left:20,overflow:'hidden', height:50, backgroundColor:bgColor, zIndex:2}
  		return(<div className='keyboardInputButton'>
			<div className='round-bg' style={rstyle}>
				<div className='pbDiv'  style={{paddingLeft:5}}>
				<button className='playButton' onClick={this.editValue}/>
				</div>
				<div className='pbContain' style={{left:-10}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
			</div>
			{ckb}
			</div>)
		}
	}
}

class InterceptorSensitivityUI extends React.Component{
	constructor(props){
		super(props);
		this.onSensA = this.onSensA.bind(this);
		this.onSensB = this.onSensB.bind(this);
	}
	onSensA(sens){
		this.props.onSens(sens,'Sens_A');
	}
	onSensB(sens){
		this.props.onSens(sens,'Sens_B')
	}
	render(){
		return <div style={{ overflow: 'hidden',borderRadius: 20, border: '8px solid #818a90',boxShadow: '0 0 14px black'}}>
		<table style={{borderSpacing:0}}>
			<tbody><tr>
					<td style={{width:340, background:'#818a90', textAlign:'center'}}>
						<div style={{marginTop:15}}>
						<KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel A'][this.props.language]['name']} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sensA} onInput={this.onSensA} inverted={false} /></div>
						</td>
					<td  style={{width:220,textAlign:'center', background:'linear-gradient(55deg, #818a90, #818a90 49.9%,#362c66 50.1%, #362c66)'}}></td>
					<td  style={{width:340, textAlign:'center', background:'#362c66'}}>
						<div style={{marginTop:15}}>
						<KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel B'][this.props.language]['name']}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sensB} onInput={this.onSensB} inverted={true}/></div>
					</td>
				
			</tr></tbody>
		</table>
		</div>
	}

}
class InterceptorDFSensitivityUI extends React.Component{
	constructor(props){
		super(props);
		this.state = {peaka:0,peakb:0, peakdf:0}
		this.renderMobile = this.renderMobile.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onSensA = this.onSensA.bind(this);
		this.onSensB = this.onSensB.bind(this);
		this.onSigMode = this.onSigMode.bind(this);
		this.selectChanged = this.selectChanged.bind(this);
		this.setPeaks = this.setPeaks.bind(this);
		this.onSigA	= this.onSigA.bind(this);
		this.onSigB = this.onSigB.bind(this);
	}
	setPeaks(a,b,df){
		if((this.state.peaka != a)||(this.state.peakb != b)||(this.state.peakdf != df)){
			this.setState({peaka:a,peakb:b, peakdf:df})
		}
	}
	onSens(sens){
		this.props.onSens(sens,'Sens');
	}
	onSensA(sens){
		this.props.onSens(sens,'Sens_A');
	}
	onSensB(sens){
		this.props.onSens(sens,'Sens_B')
	}
	onSigMode(){
		var self = this;
		setTimeout(function(){
			self.refs.sgpw.toggle()
		},150)
		
	}
	selectChanged(v,i){
		this.props.onSigMode('SigModeCombined',v)
	}
	onSigA(){
		this.props.onSigMode('sig_a')
	}
	onSigB(){
		this.props.onSigMode('sig_b')
	}
	onSigDF(){
		this.props.onSigMode('sig')
	}
	onDeny(){

	}
	onRequestClose(){

	}
	onFocus(){

	}
	renderMobile(){
		var details = '';
		var list = vdefByMac[this.props.mac][0]['@labels']['SigModeCombined']['english']
		if(this.props.level > 3){
			details = (	
				
				<div style={{ overflow: 'hidden',borderRadius: 20, border: '8px solid #818a90',boxShadow: '0 0 14px black', textAlign:'center'}}>

						<div style={{marginTop:15}}>
						<div><KeyboardInputTextButton  mobile={this.props.mobile}  language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel A'][this.props.language]['name']} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sensA} onInput={this.onSensA} inverted={false} />
						</div><div>
					<KeyboardInputTextButton mobile={this.props.mobile} onDeny={this.onDeny} language={this.props.language} label={vdefMapV2['@labels']['Signal'][this.props.language]['name'] + ' A'} onClick={this.onSigA} isEditable={false} value={this.state.peaka} inverted={false}/></div>
					
						</div>
					<div>
					<KeyboardInputTextButton mobile={this.props.mobile} language={this.props.language} tooltip={vMapV2['SigModeCombined']['@translations'][this.props.language]['description']} label={vMapV2['SigModeCombined']['@translations'][this.props.language]['name']} 
				onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={list[this.props.sigmode]} onClick={this.onSigMode} inverted={false} />
				<PopoutWheel mobile={this.props.mobile} ref='sgpw' vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={vMapV2['SigModeCombined']['@translations'][this.props.language]['name']} val={[this.props.sigmode]} options={[list]} onChange={this.selectChanged}/>
				</div>
						<div>
						<KeyboardInputTextButton mobile={this.props.mobile} language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel B'][this.props.language]['name']}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sensB} onInput={this.onSensB} inverted={false}/></div>
					<div>
					<KeyboardInputTextButton mobile={this.props.mobile}  onDeny={this.onDeny} language={this.props.language} label={vdefMapV2['@labels']['Signal'][this.props.language]['name'] + ' B'} onClick={this.onSigB} isEditable={false} value={this.state.peakb} inverted={false}/></div>
					
		</div>
		)
		}
		
		return <div>
		<div style={{textAlign:'center'}}>
				<div>
				<div><KeyboardInputTextButton mobile={this.props.mobile} language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vMapV2['Sens_A']['@translations'][this.props.language]['name']} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sens} onInput={this.onSens} inverted={false} />
				</div><div>
				<KeyboardInputTextButton mobile={this.props.mobile} language={this.props.language} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={''} onClick={this.onSigDF} isEditable={false} value={this.state.peakdf} inverted={false}/>
					</div>
				
			</div>
		</div>
		{details}
	</div>
	}
	render(){
		if(this.props.mobile){
			return this.renderMobile();
		}
		var details = '';
		var list = vdefByMac[this.props.mac][0]['@labels']['SigModeCombined']['english']
		if(this.props.level > 3){
			details = (	
				
				<div style={{ overflow: 'hidden',borderRadius: 20, border: '8px solid #818a90',boxShadow: '0 0 14px black'}}>

		<table style={{borderSpacing:0}}>
			<tbody><tr>
					<td style={{width:300, background:'#818a90', textAlign:'center'}}>
						<div style={{marginTop:15}}>
						<div><KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel A'][this.props.language]['name']} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sensA} onInput={this.onSensA} inverted={false} />
						</div><div>
					<KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language} label={vdefMapV2['@labels']['Signal'][this.props.language]['name'] + ' A'} onClick={this.onSigA} isEditable={false} value={this.state.peaka} inverted={false}/></div>
					
						</div>
						</td>
					<td  style={{width:300,textAlign:'center', background:'linear-gradient(90deg, #818a90, #818a90 49.9%,#362c66 50.1%, #362c66)'}}>
										<div>
					<KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['SigModeCombined']['@translations'][this.props.language]['description']} label={vMapV2['SigModeCombined']['@translations'][this.props.language]['name']} 
				onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={list[this.props.sigmode]} onClick={this.onSigMode} inverted={false} />
				<PopoutWheel ref='sgpw' vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={vMapV2['SigModeCombined']['@translations'][this.props.language]['name']} val={[this.props.sigmode]} options={[list]} onChange={this.selectChanged}/>
				</div>
					</td>
					<td  style={{width:300, textAlign:'center', background:'#362c66'}}>
						<div style={{marginTop:15}}>
						<div>
						<KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel B'][this.props.language]['name']}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sensB} onInput={this.onSensB} inverted={true}/></div>
						</div><div>
					<KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language} label={vdefMapV2['@labels']['Signal'][this.props.language]['name'] + ' B'} onClick={this.onSigB} isEditable={false} value={this.state.peakb} inverted={true}/></div>
					
					</td>
				
			</tr></tbody>
		</table>
		</div>
		)
		}
		
		return <div>
		<div style={{textAlign:'center'}}>
				<div><table><tbody><tr><td style={{width:450}}><KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vMapV2['Sens_A']['@translations'][this.props.language]['name']} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sens} onInput={this.onSens} inverted={false} />
				</td><td style={{width:450}}><KeyboardInputTextButton language={this.props.language} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={''} onClick={this.onSigDF} isEditable={false} value={this.state.peakdf} inverted={false}/>
					</td></tr></tbody></table>
				
			</div>
		</div>
		{details}
	</div>
	}

}
class InterceptorCalibrateUI extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({sensCalA:0,sensCalB:0,sensA:0,sensB:0,rpeak:0,xpeak:0,phaseb:0,phaseSpeedB:0, phaseModeB:0, phaseSpeed:0,phase:0,phaseMode:0, tmpStr:'', tmpStrB:'', pled_a:0, pled_b:0, det_power_a:0, det_power_b:0, pa:false,pb:false})
		this.onCalA = this.onCalA.bind(this);
		this.onCalB = this.onCalB.bind(this);
		this.calibrateAll = this.calibrateAll.bind(this);
		this.onPhaseA = this.onPhaseA.bind(this);
		this.onPhaseB = this.onPhaseB.bind(this);
		this.onModeA = this.onModeA.bind(this);
		this.onModeB = this.onModeB.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.setPleds = this.setPleds.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.lowPower = this.lowPower.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	componentWillReceiveProps (newProps) {
		// body...
	}
	setPleds(a,b){
		var self = this;
		var pa = false;
		var pb = false;
		if((a != this.state.pled_a) || (b != this.state.pled_b)){
			
			if((this.state.phaseSpeed != 0) && (a == 2)){
				pa = true;
			}

			if((this.state.phaseSpeedB != 0) && (b == 2)){
				pb = true;
			}
			//this.setState()
			this.setState({pled_a:a, pled_b:b, pa:pa, pb:pb})
			if(pa||pb){
				setTimeout(function(){
					self.refs.cfmodal.show();
				},100)
			}

		}
	}
	onCalA () {
		// body...
		this.props.calibA()
	}
	onCalB () {
		// body...
		this.props.calibB()
	}
	calibrateAll () {
		// body...
		var self = this;
		this.props.calibA()
		/*setTimeout(function () {
			// body...
			self.props.calibB()
		},100)*/

	}
	onPhaseA (p) {
		// body...
		this.props.sendPacket('phaseEdit',p)
	}
	onPhaseB (p) {
		// body...
		this.props.sendPacket('phaseEditb',p)
	}
	onModeA (m) {
		this.props.sendPacket('phaseMode',parseInt(m.target.value))
	}
	onModeB (m) {
		this.props.sendPacket('phaseModeb',parseInt(m.target.value))
	}
	onFocus () {
		this.props.onFocus();
	}
	onRequestClose () {
		this.props.onRequestClose();
	}
	lowPower(){
		var self = this;
			//console.log(9984, 'lowPower')
			this.props.sendPacket('oscPower', 0)
		setTimeout(function(){
				self.props.sendPacket('oscPowerB',0)
		},300)
		
	}
	render () {
		if(this.props.mobile){
			return this.renderMobile();
		}
		var ls = {display:'inline-block', width:120}
		var self = this;
		var modes = ['dry','wet','DSA']
		var colors = ['#c8c8c8',"#c8c800","#00c8c8", "#0000c8"]
		var ledcolors = ["#ffffff","#00ff00","#ff0000"]

		var opsA = modes[self.state.phaseMode]
		var opsB = modes[self.state.phaseModeB]



	 	return	<div >
	 	<div><CircularButton style={{width:228, lineHeight:'80px', height:70}} lab={vdefMapV2['@labels']['Learn'][this.props.language]['name']} isTransparent={true} inverted={false} onClick={this.onCalA}/></div>
	 	 <table style={{borderSpacing:0}}>
	 	 	<tbody>	
	 	 		<tr><td style={{width:422, textAlign:'center'}}><div style={{marginTop:15}}><CalibIndicator language={this.props.language} tooltip={vMapV2['PhaseAngle_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel A'][this.props.language]['name']} lab2={opsA} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phase} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.phaseSpeed]} rstyle={{backgroundColor:ledcolors[this.state.pled_a]}} overrideBG={true}/></div>
						<div style={{marginTop:5}}><KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vMapV2['Sens_A']['@translations'][this.props.language]['name'] + ' A'} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={this.state.sensA} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.sensCalA]} rstyle={{backgroundColor:ledcolors[this.state.pled_a]}} overrideBG={true}/></div>
</td><td style={{width:422, textAlign:'center'}}><div style={{marginTop:15}}><CalibIndicator language={this.props.language} tooltip={vMapV2['PhaseAngle_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel B'][this.props.language]['name']} lab2={opsB} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phaseb} onInput={this.onPhaseB} inverted={true} bgColor={colors[this.state.phaseSpeedB]} rstyle={{backgroundColor:ledcolors[this.state.pled_b]}} overrideBG={true}/></div>
						<div style={{marginTop:5}}><KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vMapV2['Sens_A']['@translations'][this.props.language]['name'] + ' B'}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={this.state.sensB} onInput={this.onPhaseB} inverted={true} bgColor={colors[this.state.sensCalB]} rstyle={{backgroundColor:ledcolors[this.state.pled_b]}} overrideBG={true}/></div>
		
				</td></tr>

	 	 	</tbody>
	 	 </table>


				<AlertModal ref='cfmodal' accept={this.lowPower}>
					<div style={{color:'#e1e1e1'}}>{'Product High Signal -   Use low power?'}</div>
				</AlertModal>
		</div>
	
		
	}
	renderMobile () {
		var ls = {display:'inline-block', width:120}
		var self = this;
		var modes = ['dry','wet','DSA']
		var colors = ['#c8c8c8',"#c8c800","#00c8c8", "#0000c8"]
		var ledcolors = ["#ffffff","#00ff00","#ff0000"]

		var opsA = modes[self.state.phaseMode]
		var opsB = modes[self.state.phaseModeB]



	 	return	<div style={{textAlign:'center'}} >
	 	<div style={{marginLeft:5, marginRight:5}}><CircularButton  style={{width:'100%', marginLeft:-8, height:43, borderWidth:5}} lab={vdefMapV2['@labels']['Learn'][this.props.language]['name']} isTransparent={true} inverted={false} onClick={this.onCalA}/></div>
	 	<div style={{marginTop:15}}><CalibIndicator  mobile={this.props.mobile}   language={this.props.language} tooltip={vMapV2['PhaseAngle_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel A'][this.props.language]['name']} lab2={opsA} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phase} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.phaseSpeed]} rstyle={{backgroundColor:ledcolors[this.state.pled_a]}} overrideBG={true}/></div>
						<div style={{marginTop:5}}><KeyboardInputTextButton mobile={this.props.mobile} language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vMapV2['Sens_A']['@translations'][this.props.language]['name'] + ' A'} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={this.state.sensA} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.sensCalA]} rstyle={{backgroundColor:ledcolors[this.state.pled_a]}} overrideBG={true}/></div>
		<div style={{marginTop:15}}><CalibIndicator  mobile={this.props.mobile}   language={this.props.language} tooltip={vMapV2['PhaseAngle_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel B'][this.props.language]['name']} lab2={opsB} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phaseb} onInput={this.onPhaseB} inverted={false} bgColor={colors[this.state.phaseSpeedB]} rstyle={{backgroundColor:ledcolors[this.state.pled_b]}} overrideBG={true}/></div>
						<div style={{marginTop:5}}><KeyboardInputTextButton mobile={this.props.mobile}  language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vMapV2['Sens_A']['@translations'][this.props.language]['name'] + ' B'}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={this.state.sensB} onInput={this.onPhaseB} inverted={false} bgColor={colors[this.state.sensCalB]} rstyle={{backgroundColor:ledcolors[this.state.pled_b]}} overrideBG={true}/></div>
		

				<AlertModal ref='cfmodal' accept={this.lowPower}>
					<div style={{color:'#e1e1e1'}}>{'Product High Signal -   Use low power?'}</div>
				</AlertModal>
		</div>
	
		
	}
}

class StealthCalibrateUI extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({phaseSpeed:0,phase:0,phaseMode:0, tmpStr:'' })
		this.onCalA = this.onCalA.bind(this);
		this.onPhaseA = this.onPhaseA.bind(this);
		this.onModeA = this.onModeA.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
	}
	componentWillReceiveProps (newProps) {
		// body...
	}
	onCalA () {
		// body...
		this.props.calib()
	}
	onPhaseA (p) {
		// body...
		this.props.sendPacket('phaseEdit',p)
	}
	onModeA (m) {
		this.props.sendPacket('phaseMode',parseInt(m.target.value))
	}
	onFocus () {
		this.props.onFocus();
	}
	onRequestClose () {
		this.props.onRequestClose();
	}
	render () {
		var ls = {display:'inline-block', width:120}
		var self = this;
		var modes = ['dry','wet','DSA']
		var colors = ['#c8c8c8',"#c8c800","#00c8c8", "#0000c8"]


		var opsA = modes.map(function (m,i) {
			// body...
			if(self.state.phaseMode == i){
				return <option value={i} selected>{m}</option>
			}else{
				return <option value={i}>{m}</option>
			}
		})
	
		return	<div>
		<table style={{borderSpacing:0}}>
			<tbody>
				<tr>
					<td style={{width:880, background:'#818a90', textAlign:'center'}}>
						<div><KeyboardInputButton language={this.props.language} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phase} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.phaseSpeed]} overrideBG={true}/></div>
						<div hidden><div className='customSelect' style={{width:150}}><select onChange={this.onModeA}>{opsA}</select></div></div>
				
						<div><CircularButton lab={'Calibrate'} isTransparent={true} inverted={false} onClick={this.onCalA}/></div>
					</td>
					
				</tr>
			</tbody>
		</table>
			
		</div>
		
	}
}

class InterceptorMeterBar extends React.Component{
	constructor(props) {
		super(props)
		this.state =  ({sig:0,sigB:0})
		this.update = this.update.bind(this);
		this.onSigB = this.onSigB.bind(this);
		this.onSigA = this.onSigA.bind(this);
	}
	update (a,b) {
		this.refs.tba.update(a);
		this.refs.tbb.update(b)
	}
	onSigB () {
		this.props.clear(0)
	}
	onSigA () {
		this.props.clear(1)
	}
	render () {
		// body...
		var tbstyle = {display:'inline-block', width:333, padding:5}
		return(<div style={{background: 'linear-gradient(75deg, rgb(129, 138, 144), rgb(129, 138, 144) 49.9%,rgb(54, 44, 102) 50.1%, rgb(54, 44, 102))', borderRadius:15,border:'5px solid #818a90', boxShadow:'0 0 14px black', marginBottom:3}}><div style={{display:'inline-block'}}>
			<div className='intmetSig' style={{color:'black'}} onClick={this.onSigA}>{this.state.sig}</div></div><div style={tbstyle}><TickerBox ref='tba'/></div>
				<div style={{display:'inline-block', width:19}}></div>
				<div style={tbstyle}><TickerBox ref='tbb'/>
				</div>
				<div style={{display:'inline-block'}}><div className='intmetSig' style={{color:'#eee'}} onClick={this.onSigB}>{this.state.sigB}</div></div>
				
				</div>)
	}
}
class StealthMeterBar extends React.Component{
	constructor(props) {
		super(props)
		this.state =  ({sig:0, sigB:0})
		this.update = this.update.bind(this);
		this.onSig = this.onSig.bind(this);
	}
	update (a) {
		this.refs.tb.update(a);
	
	}
	onSig() {
		this.props.clear(2)
	}
	render () {
		// body...
		var tbstyle = {display:'inline-block', width:700, padding:5}
		var sigStyle = {color: 'black'}
		var sigWrapperSytle = {display:'inline-block'}
		if(this.props.mobile){
			tbstyle.width = '100%'
			tbstyle.padding = 0;
			tbstyle.height = 15;
			tbstyle.overflow = 'hidden'
			//sigStyle.width = '100%'
			//sigWrapperSytle.width = '10%'
			sigWrapperSytle.display = 'none'
		}
		return(<div style={{background: 'rgb(129, 138, 144)', borderRadius:15,border:'5px solid #818a90', boxShadow:'0 0 14px black', marginBottom:3}}>
			<div style={sigWrapperSytle}>
			<div className='intmetSig' style={sigStyle} onClick={this.onSig}>{this.state.sig}</div></div><div style={tbstyle}><TickerBox ref='tb'/></div>
				</div>)
	}
}

class CustomInput extends React.Component{
	constructor(props){
		super(props);
		this.onClick = this.onClick.bind(this)
		this.onChange = this.onChange.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.onFocus = this.onFocus.bind(this);

	}
	onChange(e){
		if(typeof e == 'string'){
			var ev = {target:{value:e}}
			this.props.onChange(ev);
		}else{
			this.props.onChange(e)
		}
		
	}
	onClick(){
		this.refs.ck.toggle();
	}
	onRequestClose(){
		if(this.props.onRequestClose){
			this.props.onRequestClose();
    	}
	}
	onFocus(){
		if(this.props.onFocus){
			this.props.onFocus();
		}
	}
	render(){
		var klass = this.props.className || 'customInput';
		var style = this.props.style || {};
		var type = 'text'
		var dispVal = this.props.value
		var num = this.props.num;
		if(this.props.type == 'password'){
			type = 'password'
			dispVal = dispVal.split('').map(function(e){return '*'}).join('');
		}else if(this.props.type == 'time'){
			type = 'text';
			num = true;
			dispVal = this.props.value.split(':').join('');
			dispVal = dispVal + '000000';

			dispVal = dispVal.slice(0,2) +':'+ dispVal.slice(2,4)+':'+dispVal.slice(4,6)
		}
		if ((screen.availHeight || screen.height-30) <= window.innerHeight) {
    // code
    		

		return <React.Fragment>
				<CustomKeyboard label={this.props.label} time={this.props.type == "time"} num={num} pwd={this.props.type == "password"} onFocus={this.onFocus} onChange={this.onChange} value={this.props.value} ref='ck' onRequestClose={this.onRequestClose} language={this.props.language}/>
				<label className={klass} style={style} onClick={this.onClick}>{dispVal}</label>
			</React.Fragment>
		}else{
			return <input className={klass} style={style} value={this.props.value} type={type} onChange={this.onChange}/>
		}
	}

}
class KeyboardInputTextButton extends React.Component{
	constructor(props) {
		super(props)
		this.editValue = this.editValue.bind(this)
		this.onFocus = this.onFocus.bind(this);
		this.onInput = this.onInput.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}

	onInput (e) {
		// body...
		this.props.onInput(e)
	}
	onFocus () {
		// body...
		if(this.props.onFocus){
			//console.log('okay, on focus')
			this.props.onFocus()
		}
	}
	onRequestClose () {
		// body...
		if(this.props.onRequestClose){
			//console.log('okay, on request close')
			this.props.onRequestClose();
		}
	}
	editValue () {
		// body...
		var self = this;
		// accessControl
		if((typeof this.props.acc == 'undefined')||(this.props.acc == true)){
		if(this.props.isEditable){
			setTimeout(function () {
				// body...
				self.refs.input.toggle()
			},100)
			
		}else{
			this.props.onClick()
		}
	}else{
		
		if(this.props.onDeny){
			setTimeout(function(){
				self.props.onDeny();
			},100)
			
		}else{
			toast('Access Denied')
		}
	}
		
	}

	renderMobile(){
			var bgColor='rgba(200,200,200,1)'
		var rstyle = {}
	
		if(this.props.overrideBG){
			bgColor = this.props.bgColor || bgColor
			rstyle = this.props.rstyle || rstyle
		}
		
		var tbst = {}
		if(this.props.label.length>13){
			tbst = {fontSize:13}
		}else if(this.props.label.length > 10){
   			tbst = {fontSize:16}
   		}
		rstyle.padding = 5;
		rstyle.height = 50
		var boxShadow = '0px 0px 0px 50px '+bgColor
		var lab2 = this.props.lab2 || "";
		var ckb = <CustomKeyboard mobile={this.props.mobile} language={this.props.language} tooltip={this.props.tooltip} ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.label + lab2 +': ' + this.props.value}/>
		var	kb = <label style={{fontSize:20, textAlign:'center', width:'100%', display:'inline-block', lineHeight:'50px', marginLeft:-14}} onClick={this.editValue}>{this.props.value}</label>
		
		if(!this.props.isEditable){
			ckb = ""
		}
		if(this.props.inverted){
		var before = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:2,backgroundColor:bgColor,borderRadius:34, height:50}
		var after = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:100,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:50}
		var contStyle= {display:'inline-block',width:'100%',position:'absolute',left:14,overflow:'hidden', height:50, backgroundColor:bgColor, zIndex:2, borderRadius:10}
   		
		
		return (
			<div className='keyboardInputTextButton' style={{width:'100%'}}>
			<div onClick={this.editValue}>
			<div className='round-bg' onClick={this.editValue} style={rstyle}>
				<div className='pbContain_m'>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
				<div className='tbDiv_m' style={tbst}>{this.props.label}</div>
					
			</div>
			</div>
			{ckb}
			</div>
		);
		}else{
		var after = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:65,backgroundColor:bgColor,borderRadius:34, height:50}
		var before = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:-36,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:50}
		var contStyle= {display:'inline-block',width:'100%',position:'absolute',left:14,overflow:'hidden', height:50, backgroundColor:bgColor, zIndex:2, borderRadius:10}
  	
		return (
			<div className='keyboardInputTextButton' style={{width:'100%'}}>
			<div onClick={this.editValue}>
			<div className='round-bg' onClick={this.editValue} style={rstyle}>
				<div className='tbDiv_m' style={tbst}>{this.props.label}</div>
				<div className='pbContain_m' style={{borderTopRightRadius:25, borderBottomRightRadius:25}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				</div>

			</div>
			</div>
			{ckb}	
			</div>
		);
		}
	}
	render() {
		if(this.props.mobile){
			return this.renderMobile();
		}
		var bgColor='rgba(200,200,200,1)'
		var rstyle = {}
	
		if(this.props.overrideBG){
			bgColor = this.props.bgColor || bgColor
			rstyle = this.props.rstyle || rstyle
		}
		var tbst = {}
		if(this.props.label.length>13){
			tbst = {fontSize:20}
		}else if(this.props.label.length > 10){
   			tbst = {fontSize:22}
   		}
		rstyle.padding = 8;
		var boxShadow = '0px 0px 0px 50px '+bgColor
		var lab2 = this.props.lab2 || "";
		var ckb = <CustomKeyboard language={this.props.language} tooltip={this.props.tooltip} ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.label + lab2 +': ' + this.props.value}/>
		var	kb = <label style={{fontSize:25, textAlign:'center', width:75, display:'inline-block', lineHeight:'75px'}} onClick={this.editValue}>{this.props.value}</label>
		
		if(!this.props.isEditable){
			ckb = ""
		}
		if(this.props.inverted){
		var before = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:2,backgroundColor:bgColor,borderRadius:34, height:75}
		var after = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:100,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:75}
		var contStyle= {display:'inline-block',width:85,position:'absolute',left:14,overflow:'hidden', height:75, backgroundColor:bgColor, zIndex:2, borderRadius:10}
   		
		
		return (
			<div className='keyboardInputTextButton'>
			<div onClick={this.editValue} style={{paddingTop:3, paddingBottom:3}}>
			<div className='round-bg' onClick={this.editValue} style={rstyle}>
				<div className='pbContain' style={{display:'table-cell', width:115}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
				<div className='tbDiv' style={tbst}>{this.props.label}</div>
					
			</div>
			</div>
			{ckb}
			</div>
		);
		}else{
		var after = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:65,backgroundColor:bgColor,borderRadius:34, height:75}
		var before = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:-36,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:75}
		var contStyle= {display:'inline-block',width:85,position:'absolute',left:14,overflow:'hidden', height:75, backgroundColor:bgColor, zIndex:2, borderRadius:10}
  	
		return (
			<div className='keyboardInputTextButton'>
			<div onClick={this.editValue} style={{paddingTop:3, paddingBottom:3}}>
			<div className='round-bg' onClick={this.editValue} style={rstyle}>
				<div className='tbDiv' style={tbst}>{this.props.label}</div>
				<div className='pbContain' style={{display:'table-cell', width:115}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>

			</div>
			</div>
			{ckb}	
			</div>
		);
		}
	}
}
class CalibIndicator extends React.Component{
	constructor(props) {
		super(props)
		this.renderMobile = this.renderMobile.bind(this);
	}
	render() {
		if(this.props.mobile){
			return this.renderMobile()
		}
		var bgColor='rgba(200,200,200,1)'
		var rstyle = {}
	
		if(this.props.overrideBG){
			bgColor = this.props.bgColor || bgColor
			rstyle = this.props.rstyle || rstyle
		}
		var tbst = {}
		if(this.props.label.length>13){
			tbst = {fontSize:20}
		}else if(this.props.label.length > 10){
   			tbst = {fontSize:22}
   		}
   		var label = this.props.label
   		if(this.props.lab2){
   			label = <div>
   				<div style={{lineHeight:'45px'}}>{this.props.label}</div><div style={{lineHeight:'22px'}}>{this.props.lab2}</div>
   			</div>
   		}
		rstyle.padding = 8;
		var boxShadow = '0px 0px 0px 50px '+bgColor
		var lab2 = this.props.lab2 || "";
		var ckb = <CustomKeyboard language={this.props.language} tooltip={this.props.tooltip} ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.label + lab2 +': ' + this.props.value}/>
		var	kb = <label style={{fontSize:25, textAlign:'center', width:75, display:'inline-block', lineHeight:'75px'}} onClick={this.editValue}>{this.props.value}</label>
		
		if(!this.props.isEditable){
			ckb = ""
		}
		if(this.props.inverted){
		var before = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:2,backgroundColor:bgColor,borderRadius:34, height:75}
		var after = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:100,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:75}
		var contStyle= {display:'inline-block',width:85,position:'absolute',left:14,overflow:'hidden', height:75, backgroundColor:bgColor, zIndex:2, borderRadius:10}
   		
		
		return (
			<div className='keyboardInputTextButton'>
			<div style={{paddingTop:3, paddingBottom:3}}>
			<div className='round-bg' style={rstyle}>
				<div className='pbContain' style={{display:'table-cell', width:115}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
				<div className='tbDiv' style={tbst}>{label}</div>
					
			</div>
			</div>
			{ckb}
			</div>
		);
		}else{
		var after = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:65,backgroundColor:bgColor,borderRadius:34, height:75}
		var before = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:-36,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:75}
		var contStyle= {display:'inline-block',width:85,position:'absolute',left:14,overflow:'hidden', height:75, backgroundColor:bgColor, zIndex:2, borderRadius:10}
  	
		return (
			<div className='keyboardInputTextButton'>
			<div style={{paddingTop:3, paddingBottom:3}}>
			<div className='round-bg' style={rstyle}>
				<div className='tbDiv' style={tbst}>{label}</div>
				<div className='pbContain' style={{display:'table-cell', width:115}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>

			</div>
			</div>
			{ckb}	
			</div>
		);
		}
	}
	renderMobile() {
		var bgColor='rgba(200,200,200,1)'
		var rstyle = {}
	
		if(this.props.overrideBG){
			bgColor = this.props.bgColor || bgColor
			rstyle = this.props.rstyle || rstyle
		}
		
		var tbst = {}
		if(this.props.label.length>13){
			tbst = {fontSize:13}
		}else if(this.props.label.length > 10){
   			tbst = {fontSize:16}
   		}
		rstyle.padding = 5;
		rstyle.height = 50
		var boxShadow = '0px 0px 0px 50px '+bgColor
		var lab2 = this.props.lab2 || "";
		var ckb = <CustomKeyboard mobile={this.props.mobile} language={this.props.language} tooltip={this.props.tooltip} ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.label + lab2 +': ' + this.props.value}/>
		var	kb = <label style={{fontSize:20, textAlign:'center', width:'100%', display:'inline-block', lineHeight:'50px', marginLeft:-14}} onClick={this.editValue}>{this.props.value}</label>
		
		if(!this.props.isEditable){
			ckb = ""
		}
		if(this.props.inverted){
		var before = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:2,backgroundColor:bgColor,borderRadius:34, height:50}
		var after = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:100,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:50}
		var contStyle= {display:'inline-block',width:'100%',position:'absolute',left:14,overflow:'hidden', height:50, backgroundColor:bgColor, zIndex:2, borderRadius:10}
   		
		
		return (
			<div className='keyboardInputTextButton' style={{width:'100%'}}>
			<div onClick={this.editValue}>
			<div className='round-bg' style={rstyle}>
				<div className='pbContain_m'>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
				<div className='tbDiv_m' style={tbst}>{this.props.label}</div>
					
			</div>
			</div>
			{ckb}
			</div>
		);
		}else{
		var after = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:65,backgroundColor:bgColor,borderRadius:34, height:50}
		var before = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:-36,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:50}
		var contStyle= {display:'inline-block',width:'100%',position:'absolute',left:14,overflow:'hidden', height:50, backgroundColor:bgColor, zIndex:2, borderRadius:10}
  	
		return (
			<div className='keyboardInputTextButton' style={{width:'100%'}}>
			<div onClick={this.editValue}>
			<div className='round-bg' style={rstyle}>
				<div className='tbDiv_m' style={tbst}>{this.props.label}</div>
				<div className='pbContain_m' style={{borderTopRightRadius:25, borderBottomRightRadius:25}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				</div>

			</div>
			</div>
			{ckb}	
			</div>
		);
		}
	}
}

class CustomKeyboard extends React.Component{
	constructor(props) {
		super(props)
		this.state = {show:false}
		this.toggle = this.toggle.bind(this)
		this.close = this.close.bind(this)
		this.onChange = this.onChange.bind(this);
	}
	toggle () {
		var self   = this;
		setTimeout(function () {

			self.setState({show:true})
			/*setTimeout(function (argument) {
				// body...
				var flexText = new FlexText({container:document.querySelector('.flexCont'), items:[{elem:document.querySelector('.flexBox'), flex:1}]});
				flexText.update();
				//console.log(flexText)
				//flexText.attachTo(document.querySelector('.flexBox'));
				setTimeout(function(){flexText.update();},100);
			},100)*/
			
			if(self.props.onFocus){
				self.props.onFocus()
			}
		},100)
		
	}
	close () {
		var self = this;
		if(self.state.show){
			setTimeout(function (argument) {
				self.setState({show:false})	
				//flexText.clear();
				if(self.props.onRequestClose){
					self.props.onRequestClose();
				}
			},80)
		}
		
	}
	updateMeter(){

	}
	updateSig(){
		
	}
	onChange (value) {
		var self = this;
		this.close();
		setTimeout(function(){
			self.props.onChange(value, self.props.index, self.props.index2);
		
		}, 180)
	}
	render () {
		var cont = "";

		if(this.state.show){
			cont = <CustomKeyboardCont ref='cnt' mobile={this.props.mobile} datetime={this.props.datetime} language={this.props.language} tooltip={this.props.tooltip} pwd={this.props.pwd} onChange={this.onChange} show={this.state.show} close={this.close} value={this.props.value} num={this.props.num} label={this.props.label}/>
		}
		return <div hidden={!this.state.show} className = 'pop-modal'>
		{/*	<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>*/}
			{cont}
		</div>
	}
}
var CustomKeyboardCont = onClickOutside(createReactClass({
	getInitialState:function () {
		// body...
		return{value:"", shift:false}
	},
	componentDidMount:function () {
		// body...
		if(this.props.mobile && !this.props.num ){
			document.getElementById('inp').focus();
		}
		this.setState({value:"", shift:false})
	},
	handleClickOutside:function (e) {
		// body...
		if(this.props.show){
			this.props.close();
		}
		
	},
	close:function () {
		// body...
		this.props.close();
	},
	onKeyPress:function (char) {
		// body...
		if(char == 'clear'){
			this.clear();
		}else if(char == 'del'){
			this.onDelete();
		}else if(char == 'enter'){
			this.onEnter();
		}else if(char == 'shift'){
			this.onShift();
		}else if(char == 'cancel'){
			this.close();
		}else if((char == 'space' ) || (char == 'shortspace')){
			if(this.state.value.length < 20){
				this.setState({value:this.state.value.concat(" ")})
			}
		}else{
			if(this.state.value.length < 20){
				this.setState({value:this.state.value.concat(char)})
			}
		}
		
	},

	onEnter:function () {
		// body...
		this.props.onChange(this.state.value)
	},
	onDelete:function () {
		// body...
		this.setState({value:this.state.value.slice(0,this.state.value.length - 1)})
	},
	clear:function () {
		this.setState({value:""})
	},
	onShift :function() {
		this.setState({shift:!this.state.shift})
	},
	onChange: function(e){
		this.setState({value:e.target.value})
	},
	help: function (argument) {
		this.refs.helpModal.toggle();	
	},

	renderMobile:function(){
				var self = this;
		
		var width = 290;
		var hidden = false;
		var caps = this.state.shift
			var helpModal;
		var helpButton;
		if(typeof this.props.tooltip != 'undefined'){
			var helpWidth = 400;
			var helpMargin = 15;
			if(this.props.mobile){
				helpWidth = '90%'
				helpModal = 0;
			}
			helpButton = <div  style={{float:'right', display:'inline-block', marginLeft:-50, marginRight:helpMargin, marginTop:3}}><img src='assets/help.svg' onClick={this.help} width={30}/></div>
	  		helpModal = <Modal mobile={self.props.mobile} ref='helpModal' Style={{color:'#e1e1e1',width:helpWidth, maxWidth:400}}>
	  		<div>{this.props.tooltip}</div>
	  		</Modal>
		}
		var but1 = ''//helpButton;
		var but2 = helpButton;
		var fbwidth = 290

		var dispval = this.state.value;
		if(this.props.pwd){
			dispval = this.state.value.split('').map(function(c){return '*'}).join('');
		}
		//var tooltiptext = 'This is a tooltip'
		////console.log(this.props.vMap)
		var label = 'Enter'
		if(this.props.label && this.props.label.length > 0){
			label = this.props.label;
		}
		var minW = 400;
		if(this.props.mobile){
			minW = 300
		}

		return <div style={{paddingLeft:7,paddingRight:7}} className = 'selectmodal-outer'>
		<div style={{minWidth:minW,fontSize:20}}>
		<div className='flexCont' style={{display:'inline-block',width:fbwidth,height:45,color:'#a0a0a0',marginRight:'auto',marginLeft:'auto',display:'inline-block'}}> <span className='flexBox' style={{whiteSpace: 'nowrap'}}>
			{label}</span></div>{but2}</div>
	<div style={{height:70, position:'relative'}}>		
				<input id='inp' style={{background:'rgba(150,150,150,0.3)',display:'inline-block',fontSize:25,lineHeight:'65px',textDecoration:'underline',textUnderlinePosition:'under',textDecorationColor:'rgba(200,200,200,0.7)',height:65,color:'#eee', whiteSpace:'pre',width:width - 4, marginTop:5,marginLeft:'auto',marginRight:'auto'}} value={this.state.value} type={'text'} onChange={this.onChange}/>

		</div>
		<div style={{width:width,marginLeft:'auto',marginRight:'auto'}}>

	  	
		</div>
		{helpModal}
		<div style={{marginTop:10}}><button style={{height:60, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25, fontSize:30, lineHeight:'50px'}} onClick={this.onEnter}>{vdefMapV2['@labels']['Accept'][this.props.language].name}</button>
		<button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={this.close}>{vdefMapV2['@labels']['Cancel'][this.props.language].name}</button></div>
		</div>
	},
	render:function () {

		var self = this;
		var NumericKeyset = [['7','8','9'],['4','5','6'],['1','2','3'],['.','0','-']]
		var ANumericKeyset = [ ['1','2','3','4','5','6','7','8','9','0'],['q','w','e','r','t','y','u','i','o','p'],
							['a','s','d','f','g','h','j','k','l','@'],['shift','z','x','c','v','b','n','m','-','.'],
							['space','#','enter','cancel']]
		var TimeKeySet = [['5','6','7','8','9'],['0','1','2','3','4'],['shortspace',':','/']]
		var rows = ""
		var width = 290;
		var hidden = false;
		var caps = this.state.shift
			var helpModal;
		var helpButton;
		if(typeof this.props.tooltip != 'undefined'){
			var helpWidth = 400;
			var helpMargin = 15;
			if(this.props.mobile){
				helpWidth = '90%'
				helpModal = 0;
			}
			helpButton = <div  style={{float:'right', display:'inline-block', marginLeft:-50, marginRight:helpMargin, marginTop:3}}><img src='assets/help.svg' onClick={this.help} width={30}/></div>
	  		helpModal = <Modal mobile={self.props.mobile} ref='helpModal' Style={{color:'#e1e1e1',width:helpWidth, maxWidth:400}}>
	  		<div>{this.props.tooltip}</div>
	  		</Modal>
		}
		var but1 = ''//helpButton;
		var but2 = helpButton;
		var fbwidth = 290

		if(this.props.datetime == true){
			//console.log('datetime')
			rows = TimeKeySet.map(function (row) {
				var tds = row.map(function(k){
					//////console.log(k)
					return <CustomKey Key={k} mobile={self.props.mobile}  caps={false} onPress={self.onKeyPress}/>
				})
				return <tr>{tds}</tr>
			})
			fbwidth = 500;
			width = 610;
		}else if(this.props.num){
			//but1= helpButton;
			rows = NumericKeyset.map(function (row) {
				var tds = row.map(function(k){
					//////console.log(k)
					return <CustomKey Key={k} mobile={self.props.mobile} caps={false} onPress={self.onKeyPress}/>
				})
				return <tr>{tds}</tr>
			})
		}else{
			if(this.props.mobile){
				return this.renderMobile()
			}
			hidden = true;
			fbwidth = 830
			//but2 = helpButton
			rows = ANumericKeyset.map(function (row) {
				var tds = row.map(function(key){
					if(caps){
						if (key.length == 1){
							key = key.toUpperCase();
						}
						if(key == '-'){
							key = '_';
						}
					}
					return <CustomKey Key={key} caps={caps} onPress={self.onKeyPress}/>
				})
				return <tr>{tds}</tr>
			})
			width = 940
		}
		var dispval = this.state.value;
		if(this.props.pwd){
			dispval = this.state.value.split('').map(function(c){return '*'}).join('');
		}
		//var tooltiptext = 'This is a tooltip'
		////console.log(this.props.vMap)
		var label = 'Enter'
		if(this.props.label && this.props.label.length > 0){
			label = this.props.label;
		}
		var minW = 400;
		if(this.props.mobile){
			minW = 300
		}

		return <div style={{paddingLeft:7,paddingRight:7}} className = 'selectmodal-outer'>
		<div style={{minWidth:minW,fontSize:20}}><div className='flexCont' style={{display:'inline-block',width:fbwidth,height:45,color:'#a0a0a0',marginRight:'auto',marginLeft:'auto',display:'inline-block'}}> <span className='flexBox' style={{whiteSpace: 'nowrap'}}>
			{label}</span></div>{but2}</div>
	<div style={{height:70, position:'relative'}}>		<svg style={{position:'absolute', top:14, marginLeft:3}} onClick={this.clear} xmlns="http://www.w3.org/2000/svg" height="40" version="1.1" viewBox="0 0 32 32" width="40"><g id="Layer_1"/><g id="x_x5F_alt"><path d="M16,0C7.164,0,0,7.164,0,16s7.164,16,16,16s16-7.164,16-16S24.836,0,16,0z M23.914,21.086   l-2.828,2.828L16,18.828l-5.086,5.086l-2.828-2.828L13.172,16l-5.086-5.086l2.828-2.828L16,13.172l5.086-5.086l2.828,2.828   L18.828,16L23.914,21.086z" fill="#3E3E40"/></g></svg>
	<div style={{background:'rgba(150,150,150,0.3)',display:'inline-block',fontSize:25,lineHeight:'65px',textDecoration:'underline',textUnderlinePosition:'under',textDecorationColor:'rgba(200,200,200,0.7)',height:65,color:'#eee', whiteSpace:'pre',width:width - 4, marginTop:5,marginLeft:'auto',marginRight:'auto'}}>{dispval}</div>{but1}
<svg style={{position:'absolute', top:10, marginLeft:-52, width:50}} onClick={this.onDelete} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#3E3E40" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/></svg>
		</div>
		<div style={{width:width,marginLeft:'auto',marginRight:'auto'}}>
		<table style={{tableLayout:'fixed', position:'relative', top:0,width:width}}className='customKeyboardTable'><tbody style={{display:'table-row-group'}}>
			{rows}
		</tbody></table>
		
	  	
		</div>
		{helpModal}
		<div hidden={hidden}><button style={{height:60, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25, fontSize:30, lineHeight:'50px'}} onClick={this.onEnter}>{vdefMapV2['@labels']['Accept'][this.props.language].name}</button>
		<button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={this.close}>{vdefMapV2['@labels']['Cancel'][this.props.language].name}</button></div>
		</div>
	  	
	}
}))
class DateTimeSelect extends React.Component{
	constructor(props){
		super(props)
		this.state = {year:'1996',month:'01',day:'01', hour:'00',minute:'00',sec:'00'}
		this.getDT = this.getDT.bind(this);
		this.setDT = this.setDT.bind(this);
		this.onDateChange = this.onDateChange.bind(this);
		this.onTimeChange = this.onTimeChange.bind(this);
		this.onDSTChange = this.onDSTChange.bind(this);
	}
	getDT(dtstring){
		var dtarray = dtstring.split(' ');
		var date = dtarray[0].split('/');
		var time = dtarray[1].split(':')
		this.setState({year:date[0],month:date[1],day:date[2],hour:time[0],minute:time[1],sec:time[2]})
	}
	setDT(){
		var dt = this.state.year +'/'+this.state.month+'/'+this.state.day + ' ' + this.state.hour +':'+this.state.minute+':'+this.state.sec
		this.props.setDT(dt)
	}
	onDateChange(_date,i){
		var date = [parseInt(this.state.year),parseInt(this.state.month),parseInt(this.state.day)]
		date[i] = _date;
		this.setState({year:(date[0] + 1996).toString(), month:('00'+ date[1]).slice(-2).toString(), day:('00'+ date[2]).slice(-2).toString()})
	}
	onTimeChange(_time,i){
		var time = [parseInt(this.state.hour),parseInt(this.state.minute),parseInt(this.state.sec)]
		time[i] = _time;
		//console.log(1532131312, [_time,i])
		this.setState({hour:('00'+ time[0]).slice(-2).toString(), minute:('00'+ time[1]).slice(-2).toString(), sec:('00'+ time[2]).slice(-2).toString()})
	}
	onDSTChange(dst,i){
		//console.log(dst)
		this.props.setDST(dst)
	}
	render(){

		var years = [];
		var months = [];
		var days = [];
		var hours = [];
		var minutes = [];
		var secs = [];

		for(var i = 0; i < 40; i++){
			years.push( (1996+i).toString());
		}
		for(var i=0; i<12;i++){
			months.push(('00'+(i+1)).slice(-2));
		}
		for(var i=0; i<31;i++){
			days.push(('00'+(i+1)).slice(-2));
		}
		for(var i=0; i<24;i++){
			hours.push(('00'+i).slice(-2));
		}
		for(var i=0; i<60;i++){
			minutes.push(('00'+i).slice(-2));
		}
		for(var i=0; i<60;i++){
			secs.push(('00'+i).slice(-2));
		}
		var date = [years.indexOf(this.state.year), months.indexOf(this.state.month), days.indexOf(this.state.day)];
		var time = [hours.indexOf(this.state.hour), minutes.indexOf(this.state.minute), secs.indexOf(this.state.sec)]
		var tg = ['off','on']
		var namestring = 'Select User'
		var dpw = <PopoutWheel vMap={vMapV2['Date']} language={this.props.language} interceptor={false} name={'Date'} ref='dpw' val={date} options={[years,months,days]} onChange={this.onDateChange}/>
		var tpw = <PopoutWheel vMap={vMapV2['Time']} language={this.props.language} interceptor={false} name={'Time'} ref='tpw' val={time} options={[hours,minutes,secs]} onChange={this.onTimeChange}/>
		var dstpw = <PopoutWheel vMap={vMapV2['DST']} language={this.props.language} interceptor={false} name={'Daylight Savings'} ref='dstpw' val={[this.props.dst]} options={[['off','on']]} onChange={this.onDSTChange}/>
		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
			var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}


		    
		var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26,fontWeight:500, color:"#eee"}} >
			<div style={{display:'inline-block', textAlign:'center'}}>DateTime</div></h2></span>)
		var clr = "#e1e1e1"
		var dateItem =  (<div className='sItem noChild' style={{borderCollapse:'collapse'}} onClick={()=>this.refs.dpw.toggle()}>
			<label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Date'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.state.year +'/'+this.state.month+'/'+this.state.day}</label></div></div>
			</div>)
		var timeItem =  (<div className='sItem noChild' style={{borderCollapse:'collapse'}} onClick={()=>this.refs.tpw.toggle()}>
			<label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Time'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.state.hour +':'+this.state.minute+':'+this.state.sec}</label></div></div>
			</div>)
		var dstItem =  (<div className='sItem noChild' style={{borderCollapse:'collapse'}} onClick={()=>this.refs.dstpw.toggle()}>
			<label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Daylight Savings'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{tg[this.props.dst]}</label></div></div>
			</div>)
		return <div style={{position:'relative'}}>{tpw}{dpw}{dstpw}
		<div>
		{titlediv}
		
		</div>
			{dateItem}
			{timeItem}
			{dstItem}
			<button className='customAlertButton' onClick={this.setDT}>Set DateTime</button>
		</div> 
	}
}
class CustomKey extends React.Component{
	constructor(props) {
		super(props)
		this.onPress = this.onPress.bind(this)
	}
	onPress () {
		// body...
		this.props.onPress(this.props.Key)
	}
	render () {
		// body...
		var klass = 'customKey'
		if(this.props.mobile){
			klass = 'customKey_m'
		}
		if(this.props.Key == 'space'){
			return	<td onClick={this.onPress} className={klass} colSpan={5}><div style={{marginBottom:-15}}><svg xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M18 9v4H6V9H4v6h16V9z"/></svg></div></td>
		}else if(this.props.Key == 'shortspace'){
			return	<td onClick={this.onPress} className={klass} colSpan={3}><div style={{marginBottom:-15}}><svg xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M18 9v4H6V9H4v6h16V9z"/></svg></div></td>
	
		}else if(this.props.Key == 'del'){
			return	<td onClick={this.onPress} className={klass}><div style={{marginBottom:-15}}><svg xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z"/></svg></div></td>
		}else if(this.props.Key == 'enter'){
			return  <td onClick={this.onPress} className={klass} colSpan={2}><div style={{marginBottom:0, fontSize:30}}>Accept</div></td>
		
		}else if(this.props.Key == 'shift'){
			var fill = "#000000"
			var st = {}
			if(this.props.caps){
				fill = "#eeeeee"
				st={background:'#808a90'}
			}
			return <td style={st} onClick={this.onPress} className={klass}><div style={{marginBottom:-15}}><svg fill={fill} xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M12 8.41L16.59 13 18 11.59l-6-6-6 6L7.41 13 12 8.41zM6 18h12v-2H6v2z"/></svg></div></td>
		}else if(this.props.Key == 'cancel'){
			return <td onClick={this.onPress} className={klass} colSpan={2}><div style={{marginBottom:0, fontSize:30}}>Cancel</div></td>
			
	
		}else{

			return <td onClick={this.onPress} className={klass}>{this.props.Key.slice(0,1)}</td>
		}
		
	}
}
class TreeNode extends React.Component{
	constructor(props){		
		super(props) 
		this.state = ({hidden:true})
		this.toggle = this.toggle.bind(this)
	}
	toggle(){
		var hidden = !this.state.hidden
		this.setState({hidden:hidden});
	}
	render(){
		var cName = "collapsed"
		if(!this.state.hidden){
			cName = "expanded"
		}
		return (
			<div hidden={this.props.hide} className="treeNode">
				<div onClick={this.toggle} />
				<div className="nodeName">
					<label className={cName} onClick={this.toggle}>{this.props.nodeName}</label>
				</div>
				<div className="innerDiv" hidden={this.state.hidden}>
				{this.props.children}
				</div>
			</div>
		)
	}
}
class CanvasElem extends React.Component{
	constructor(props){	
		super(props)
		this.line = new TimeSeries();
		this.line_b = new TimeSeries();
		this.line_com = new TimeSeries();
		this.smoothie = new SmoothieChart({millisPerPixel:this.props.mpp,interpolation:'linear',maxValueScale:1.1,minValueScale:1.2,
			horizontalLines:[{color:'#000000',lineWidth:1,value:0},{color:'#880000',lineWidth:2,value:100},{color:'#880000',lineWidth:2,value:-100}],
			labels:{fillStyle:'#808a90'}, grid:{millisPerLine:2000,fillStyle:'rgba(256,256,256,0)'}, yRangeFunction:yRangeFunc, maxDataSetLength:700, minDataSetLength:300, limitFPS:15});
		
		this.state =  ({update:true})
		this.stream = this.stream.bind(this);
		this.pauseGraph = this.pauseGraph.bind(this);
		this.restart = this.restart.bind(this);
	}
	componentWillUnmount(){
		this.smoothie.stop();
		this.smoothie = null;
		this.line = null;
		this.line_b
		this.line_com = null;
	}
	shouldComponentUpdate(){
		return false;
	}
	pauseGraph(){
		this.setState({update:false})
		this.smoothie.stop()
		//this.state.smoothie.setTargetFPS(8)
	}
	restart(){
		this.setState({update:true})
		this.smoothie.start()
		//this.state.smoothie.setTargetFPS(15)
	}
	componentDidMount(){
		//var smoothie = this.state.smoothie;
		//smoothie.setTargetFPS(15)
		this.smoothie.streamTo(document.getElementById(this.props.canvasId));
		if(this.props.df){
			this.smoothie.addTimeSeries(this.line_com, {lineWidth:2,strokeStyle:'rgb(0, 128, 128)'});
			this.smoothie.addTimeSeries(this.line_b, {lineWidth:2,strokeStyle:'rgb(128, 128, 128)'});
			this.smoothie.addTimeSeries(this.line, {lineWidth:2,strokeStyle:'rgb(128, 0, 128)'});
		}else if(this.props.int){
			this.smoothie.addTimeSeries(this.line_b, {lineWidth:2,strokeStyle:'rgb(128, 128, 128)'});
			this.smoothie.addTimeSeries(this.line, {lineWidth:2,strokeStyle:'rgb(128, 0, 128)'});
		
		}else{
			this.smoothie.addTimeSeries(this.line, {lineWidth:2,strokeStyle:'#ff00ff'});
	
		}
	}
	stream(dat) {
		if(this.state.update){
		this.line.append(dat.t, dat.val);
		if(this.props.df){
			var combVal = dat.valCom
			if(this.props.combineMode == 1){
				combVal = (dat.val + dat.valb)*this.props.sens/this.props.thresh
			}else{
				combVal = Math.max(dat.val, dat.valb)*this.props.sens/this.props.thresh
			}
			this.line_com.append(dat.t, combVal)
			
		
		} 
		if(this.props.int){
			this.line_b.append(dat.t, dat.valb)
				
		}
	}
	/*	if(this.state.line.data.length > 3000){
			this.state.line.dropOldData(1000, 3000)
			this.state.line_com.dropOldData(1000, 3000)
			this.state.line_b.dropOldData(1000, 3000)

		}*/
	}

		render(){
			console.log('rendering canvas')
		return(
			<div className="canvElem">
				<canvas id={this.props.canvasId} height={this.props.h} width={this.props.w}></canvas>
			</div>
		);
	}
}
ReactDOM.render(<Container/>,document.getElementById('content'))

