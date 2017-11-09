var React = require('react');
var ReactDOM = require('react-dom')
//import {ConcreteElem,CanvasElem,TreeNode} from './components.jsx';
var SmoothieChart = require('./smoothie.js').SmoothieChart;
var TimeSeries = require('./smoothie.js').TimeSeries;

var onClickOutside = require('react-onclickoutside');
//var OnClickOutside = require('react-onclickoutside-es6')
import Notifications, {notify} from 'react-notify-toast';
var createReactClass = require('create-react-class')


const _buildVersion = 'display';

const inputSrcArr = ['NONE','TACH','EYE','RC_1','RC_2','REJ_EYE', 'AIR_PRES' ,'REJ_LATCH','BIN_FULL','REJ_PRESENT','DOOR1_OPEN','DOOR2_OPEN','CLEAR_FAULTS','CIP','PROD_SEL1', 'PROD_SEL2', 'PROD_SEL3','PROD_SEL4']
const outputSrcArr = ['NONE', 'REJ_MAIN', 'REJ_ALT','FAULT','TEST_REQ', 'HALO_FE','HALO_NFE','HALO_SS','LS_RED','LS_YEL', 'LS_GRN','LS_BUZ','DOOR_LOCK','SHUTDOWN_LANE']

var vdefMapV2 ={
	"@categories":{"cat":"@root","params":["Language"],"subCats":[{"cat":"Reject","params":["RejDelSec","RejDelSec2","RejDurSec","RejDurSec2","RejMode"],"subCats":[{"cat":"Additional Settings","params":[],"subCats":[{"cat":"Distances","params":["RejExitDist","RejExitWin","AppUnitDist"],"subCats":[]},{"cat":"Belt Speed","params":["BeltSpeed"],"subCats":[]},{"cat":"Latch","params":["FaultLatch","RejLatchMode","Rej2Latch"],"subCats":[]},{"cat":"Clocks","params":["RejBinDoorTime","CIPCycleTime","CIPDwellTime","FaultClearTime","EyeBlockTime","RejCheckTime","ExcessRejTime","RejDelClock"],"subCats":[]}]}]},{"cat":"Password","params":["PW1","PW2","PW3","PW4","PassAccSens","PassAccProd","PassAccCal","PassAccTest","PassAccSelUnit","PassAccClrFaults","PassAccClrRej","PassAccClrLatch","PassAccTime","PassAccSync"],"subCats":[]},{"cat":"IO","params":[],"subCats":[{"cat":"Inputs","params":["INPUT_TACH","INPUT_EYE","INPUT_RC_1","INPUT_RC_2","INPUT_REJ_EYE","INPUT_AIR_PRES","INPUT_REJ_LATCH","INPUT_BIN_FULL","INPUT_REJ_PRESENT","INPUT_DOOR1_OPEN","INPUT_DOOR2_OPEN","INPUT_CLEAR_FAULTS","INPUT_CIP","INPUT_PROD_SEL1","INPUT_PROD_SEL2","INPUT_PROD_SEL3","INPUT_PROD_SEL4","INPUT_TEST"],"subCats":[]},{"cat":"Outputs","params":["OUT_PHY_PL3_1","OUT_PHY_PL11_1A2","OUT_PHY_PL11_3A4","OUT_PHY_PL11_5A6","OUT_PHY_PL4_1","OUT_PHY_PL4_2","OUT_PHY_PL4_3","OUT_PHY_PL4_5","OUT_PHY_IO_PL3_R1","OUT_PHY_IO_PL3_R2","OUT_PHY_IO_PL3_O1","OUT_PHY_IO_PL3_O2","OUT_PHY_IO_PL3_O3","OUT_PHY_IO_PL4_02","OUT_PHY_IO_PL4_03","OUT_PHY_IO_PL4_04","OUT_PHY_IO_PL4_05"],"subCats":[]}]},{"cat":"System","params":["SRecordDate","ProdNo","Unit"],"subCats":[]},{"cat":"Fault","params":["RefFaultMask","BalFaultMask","ProdMemFaultMask","RejConfirmFaultMask","PhaseFaultMask","TestSigFaultMask","PeyeBlockFaultMask","RejBinFullFaultMask","AirFaultMask","ExcessRejFaultMask","BigMetalFaultMask","NetBufferFaultMask","RejMemoryFaultMask","RejectExitFaultMask","TachometerFaultMask","PatternFaultMask","ExitNoPackFaultMask","ExitNewPackFaultMask","InterceptorFaultMask","RtcLowBatFaultMask","RtcTimeFaultMask","IntUsbFaultMask","IoBoardFaultMask","HaloFaultMask","SignalFaultMask"],"subCats":[]}]},"@vMap":{"Sens_A":{"@parent":"","@translations":{"english":{"name":"Sensitivity","description":""},"korean":{"name":"민감도","description":""},"spanish":{"name":"Sensitivity","description":""},"french":{"name":"Sensitivity","description":""}},"children":["Sens_B"],"@labels":["Channel A","Channel B"]},"DetThresh_A":{"@parent":"","@translations":{"english":{"name":"Detection Threshold","description":""},"korean":{"name":"검출역치 ","description":""},"spanish":{"name":"Detection Threshold","description":""},"french":{"name":"Detection Threshold","description":""}},"children":["DetThresh_B"],"@labels":["Channel A","Channel B"]},"ThresProdHi_A":{"@parent":"","@translations":{"english":{"name":"Product High Threshold","description":""},"korean":{"name":"교정한계치","description":""},"spanish":{"name":"Product High Threshold","description":""},"french":{"name":"Product High Threshold","description":""}},"children":["ThresProdHi_B"],"@labels":["Channel A","Channel B"]},"ThresX_A":{"@parent":"","@translations":{"english":{"name":"X Threshold","description":""},"korean":{"name":"X 역치","description":""},"spanish":{"name":"X Threshold","description":""},"french":{"name":"X Threshold","description":""}},"children":["ThresX_B"],"@labels":["Channel A","Channel B"]},"ThresR_A":{"@parent":"","@translations":{"english":{"name":"R Threshold","description":""},"korean":{"name":"R 역치","description":""},"spanish":{"name":"R Threshold","description":""},"french":{"name":"R Threshold","description":""}},"children":["ThresR_B"],"@labels":["Channel A","Channel B"]},"BigMetThres_A":{"@parent":"","@translations":{"english":{"name":"Large Metal Threshold","description":""},"korean":{"name":"대량금속 역치","description":""},"spanish":{"name":"Large Metal Threshold","description":""},"french":{"name":"Large Metal Threshold","description":""}},"children":["BigMetThres_B"],"@labels":["Channel A","Channel B"]},"DetMode_A":{"@parent":"","@translations":{"english":{"name":"Detection Mode","description":""},"korean":{"name":"검출방식","description":""},"spanish":{"name":"Detection Mode","description":""},"french":{"name":"Detection Mode","description":""}},"children":["DetMode_B"],"@labels":["Channel A","Channel B"]},"NoiseR_A":{"@parent":"","@translations":{"english":{"name":"R Channel Noise","description":""},"korean":{"name":"R 채널 노이즈","description":""},"spanish":{"name":"R Channel Noise","description":""},"french":{"name":"R Channel Noise","description":""}},"children":["NoiseR_B"],"@labels":["Channel A","Channel B"]},"NoiseX_A":{"@parent":"","@translations":{"english":{"name":"X Channel Noise","description":""},"korean":{"name":"X 채널 노이즈","description":""},"spanish":{"name":"X Channel Noise","description":""},"french":{"name":"X Channel Noise","description":""}},"children":["NoiseX_B"],"@labels":["Channel A","Channel B"]},"DetThEst_A":{"@parent":"","@translations":{"english":{"name":"Detection Threshold Est","description":""},"korean":{"name":"검출역치 추정값","description":""},"spanish":{"name":"Detection Threshold Est","description":""},"french":{"name":"Detection Threshold Est","description":""}},"children":["DetThEst_B"],"@labels":["Channel A","Channel B"]},"FilterNoise_A":{"@parent":"","@translations":{"english":{"name":"Filter Noise","description":""},"korean":{"name":"필터 노이즈","description":""},"spanish":{"name":"Filter Noise","description":""},"french":{"name":"Filter Noise","description":""}},"children":["FilterNoise_B"],"@labels":["Channel A","Channel B"]},"OscPower_A":{"@parent":"","@translations":{"english":{"name":"Oscillation Power","description":""},"korean":{"name":"진동 출력","description":""},"spanish":{"name":"Oscillation Power","description":""},"french":{"name":"Oscillation Power","description":""}},"children":["OscPower_B"],"@labels":["Channel A","Channel B"]},"FmInput_A":{"@parent":"","@translations":{"english":{"name":"FM Input ","description":""},"korean":{"name":"FM 입력","description":""},"spanish":{"name":"FM Input ","description":""},"french":{"name":"FM Input ","description":""}},"children":["FmInput_B"],"@labels":["Channel A","Channel B"]},"TestTime":{"@parent":"","@translations":{"english":{"name":"Test Interval","description":""},"korean":{"name":"테스트 간격","description":""},"spanish":{"name":"Test Interval","description":""},"french":{"name":"Test Interval","description":""}},"children":[],"@labels":["Test Interval"]},"TestDeferTime":{"@parent":"","@translations":{"english":{"name":"Test Defer TIme","description":""},"korean":{"name":"테스트 지연 시간","description":""},"spanish":{"name":"Test Defer TIme","description":""},"french":{"name":"Test Defer TIme","description":""}},"children":[],"@labels":["Test Defer TIme"]},"TestMode":{"@parent":"","@translations":{"english":{"name":"Test Mode","description":""},"korean":{"name":"테스트 방식","description":""},"spanish":{"name":"Test Mode","description":""},"french":{"name":"Test Mode","description":""}},"children":[],"@labels":["Test Mode"]},"TestConfigCount0_0":{"@parent":"","@translations":{"english":{"name":"Test 1","description":"Count is number of passes. Select Metal Type to test on the specified signal chain"},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":"Count is number of passes. Select Metal Type to test on the specified signal chain"},"french":{"name":"Test 1","description":"Count is number of passes. Select Metal Type to test on the specified signal chain"}},"children":["TestConfigMetal0_0","TestConfigFreq0_0"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount0_1":{"@parent":"","@translations":{"english":{"name":"Test 2","description":""},"korean":{"name":"Test 2","description":""},"spanish":{"name":"Test 2","description":""},"french":{"name":"Test 2","description":""}},"children":["TestConfigMetal0_1","TestConfigFreq0_1"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount0_2":{"@parent":"","@translations":{"english":{"name":"Test 3","description":""},"korean":{"name":"Test 3","description":""},"spanish":{"name":"Test 3","description":""},"french":{"name":"Test 3","description":""}},"children":["TestConfigMetal0_2","TestConfigFreq0_2"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount0_3":{"@parent":"","@translations":{"english":{"name":"Test 4","description":""},"korean":{"name":"Test 4","description":""},"spanish":{"name":"Test 4","description":""},"french":{"name":"Test 4","description":""}},"children":["TestConfigMetal0_3","TestConfigFreq0_3"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount0_4":{"@parent":"","@translations":{"english":{"name":"Test 5","description":""},"korean":{"name":"Test 5","description":""},"spanish":{"name":"Test 5","description":""},"french":{"name":"Test 5","description":""}},"children":["TestConfigMetal0_4","TestConfigFreq0_4"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount0_5":{"@parent":"","@translations":{"english":{"name":"Test 6","description":""},"korean":{"name":"Test 6","description":""},"spanish":{"name":"Test 6","description":""},"french":{"name":"Test 6","description":""}},"children":["TestConfigMetal0_5","TestConfigFreq0_5"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigAck0":{"@parent":"","@translations":{"english":{"name":"Acknowledge","description":""},"korean":{"name":"확인","description":""},"spanish":{"name":"Acknowledge","description":""},"french":{"name":"Acknowledge","description":""}},"children":[],"@labels":["Acknowledge"]},"TestConfigOperator0":{"@parent":"","@translations":{"english":{"name":"Operator","description":""},"korean":{"name":"Operator","description":""},"spanish":{"name":"Operator","description":""},"french":{"name":"Operator","description":""}},"children":[],"@labels":["Operator"]},"TestConfigHaloMode0":{"@parent":"","@translations":{"english":{"name":"Halo Mode","description":""},"korean":{"name":"Halo Mode","description":""},"spanish":{"name":"Halo Mode","description":""},"french":{"name":"Halo Mode","description":""}},"children":[],"@labels":["Halo Mode"]},"TestConfigCount1_0":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal1_0","TestConfigFreq1_0"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount1_1":{"@parent":"","@translations":{"english":{"name":"Test 2","description":""},"korean":{"name":"Test 2","description":""},"spanish":{"name":"Test 2","description":""},"french":{"name":"Test 2","description":""}},"children":["TestConfigMetal1_1","TestConfigFreq1_1"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount1_2":{"@parent":"","@translations":{"english":{"name":"Test 3","description":""},"korean":{"name":"Test 3","description":""},"spanish":{"name":"Test 3","description":""},"french":{"name":"Test 3","description":""}},"children":["TestConfigMetal1_2","TestConfigFreq1_2"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount1_3":{"@parent":"","@translations":{"english":{"name":"Test 4","description":""},"korean":{"name":"Test 4","description":""},"spanish":{"name":"Test 4","description":""},"french":{"name":"Test 4","description":""}},"children":["TestConfigMetal1_3","TestConfigFreq1_3"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount1_4":{"@parent":"","@translations":{"english":{"name":"Test 5","description":""},"korean":{"name":"Test 5","description":""},"spanish":{"name":"Test 5","description":""},"french":{"name":"Test 5","description":""}},"children":["TestConfigMetal1_4","TestConfigFreq1_4"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount1_5":{"@parent":"","@translations":{"english":{"name":"Test 6","description":""},"korean":{"name":"Test 6","description":""},"spanish":{"name":"Test 6","description":""},"french":{"name":"Test 6","description":""}},"children":["TestConfigMetal1_5","TestConfigFreq1_5"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigAck1":{"@parent":"","@translations":{"english":{"name":"Acknowledge","description":""},"korean":{"name":"Acknowledge","description":""},"spanish":{"name":"Acknowledge","description":""},"french":{"name":"Acknowledge","description":""}},"children":[],"@labels":["Acknowledge"]},"TestConfigOperator1":{"@parent":"","@translations":{"english":{"name":"Operator","description":""},"korean":{"name":"Operator","description":""},"spanish":{"name":"Operator","description":""},"french":{"name":"Operator","description":""}},"children":[],"@labels":["Operator"]},"TestConfigHaloMode1":{"@parent":"","@translations":{"english":{"name":"Halo Mode","description":""},"korean":{"name":"Halo Mode","description":""},"spanish":{"name":"Halo Mode","description":""},"french":{"name":"Halo Mode","description":""}},"children":[],"@labels":["Halo Mode"]},"TestConfigCount2_0":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_0","TestConfigFreq2_0"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount2_1":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_1","TestConfigFreq2_1"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount2_2":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_2","TestConfigFreq2_2"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount2_3":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_3","TestConfigFreq2_3"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount2_4":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_4","TestConfigFreq2_4"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount2_5":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_5","TestConfigFreq2_5"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigAck2":{"@parent":"","@translations":{"english":{"name":"Acknowledge","description":""},"korean":{"name":"Acknowledge","description":""},"spanish":{"name":"Acknowledge","description":""},"french":{"name":"Acknowledge","description":""}},"children":[],"@labels":["Acknowledge"]},"TestConfigOperator2":{"@parent":"","@translations":{"english":{"name":"Operator","description":""},"korean":{"name":"Operator","description":""},"spanish":{"name":"Operator","description":""},"french":{"name":"Operator","description":""}},"children":[],"@labels":["Operator"]},"TestConfigHaloMode2":{"@parent":"","@translations":{"english":{"name":"Halo Mode","description":""},"korean":{"name":"Halo Mode","description":""},"spanish":{"name":"Halo Mode","description":""},"french":{"name":"Halo Mode","description":""}},"children":[],"@labels":["Halo Mode"]},"TestConfigCount3_0":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_0","TestConfigFreq3_0"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount3_1":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_1","TestConfigFreq3_1"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount3_2":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_2","TestConfigFreq3_2"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount3_3":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_3","TestConfigFreq3_3"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount3_4":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_4","TestConfigFreq3_4"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount3_5":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""},"french":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_5","TestConfigFreq3_5"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigAck3":{"@parent":"","@translations":{"english":{"name":"Acknowledge","description":""},"korean":{"name":"Acknowledge","description":""},"spanish":{"name":"Acknowledge","description":""},"french":{"name":"Acknowledge","description":""}},"children":[],"@labels":["Acknowledge"]},"TestConfigOperator3":{"@parent":"","@translations":{"english":{"name":"Operator","description":""},"korean":{"name":"Operator","description":""},"spanish":{"name":"Operator","description":""},"french":{"name":"Operator","description":""}},"children":[],"@labels":["Operator"]},"TestConfigHaloMode3":{"@parent":"","@translations":{"english":{"name":"Halo Mode","description":""},"korean":{"name":"Halo Mode","description":""},"spanish":{"name":"Halo Mode","description":""},"french":{"name":"Halo Mode","description":""}},"children":[],"@labels":["Halo Mode"]},"HaloPeakRFe_A":{"@parent":"","@translations":{"english":{"name":"Ferrous R Peak","description":""},"korean":{"name":"Ferrous R Peak","description":""},"spanish":{"name":"Ferrous R Peak","description":""},"french":{"name":"Ferrous R Peak","description":""}},"children":["HaloPeakRFe_B"],"@labels":["Channel A","Channel B"]},"HaloPeakXFe_A":{"@parent":"","@translations":{"english":{"name":"Ferrous X Peak","description":""},"korean":{"name":"Ferrous X Peak","description":""},"spanish":{"name":"Ferrous X Peak","description":""},"french":{"name":"Ferrous X Peak","description":""}},"children":["HaloPeakXFe_B"],"@labels":["Channel A","Channel B"]},"HaloPeakRNFe_A":{"@parent":"","@translations":{"english":{"name":"Non-Ferrous R Peak","description":""},"korean":{"name":"Non-Ferrous R Peak","description":""},"spanish":{"name":"Non-Ferrous R Peak","description":""},"french":{"name":"Non-Ferrous R Peak","description":""}},"children":["HaloPeakRNFe_B"],"@labels":["Channel A","Channel B"]},"HaloPeakXNFe_A":{"@parent":"","@translations":{"english":{"name":"Non-Ferrous X Peak","description":""},"korean":{"name":"Non-Ferrous X Peak","description":""},"spanish":{"name":"Non-Ferrous X Peak","description":""},"french":{"name":"Non-Ferrous X Peak","description":""}},"children":["HaloPeakXNFe_B"],"@labels":["Channel A","Channel B"]},"HaloPeakRSs_A":{"@parent":"","@translations":{"english":{"name":"Stainless R Peak","description":""},"korean":{"name":"Stainless R Peak","description":""},"spanish":{"name":"Stainless R Peak","description":""},"french":{"name":"Stainless R Peak","description":""}},"children":["HaloPeakRSs_B"],"@labels":["Channel A","Channel B"]},"HaloPeakXSs_A":{"@parent":"","@translations":{"english":{"name":"Stainless X Peak","description":""},"korean":{"name":"Stainless X Peak","description":""},"spanish":{"name":"Stainless X Peak","description":""},"french":{"name":"Stainless X Peak","description":""}},"children":["HaloPeakXSs_B"],"@labels":["Channel A","Channel B"]},"PhaseAngle_A":{"@parent":"","@translations":{"english":{"name":"Phase Angle","description":""},"korean":{"name":"Phase Angle","description":""},"spanish":{"name":"Phase Angle","description":""},"french":{"name":"Phase Angle","description":""}},"children":["PhaseAngle_B"],"@labels":["Channel A","Channel B"]},"PhaseMode_A":{"@parent":"","@translations":{"english":{"name":"Phase Mode","description":""},"korean":{"name":"Phase Mode","description":""},"spanish":{"name":"Phase Mode","description":""},"french":{"name":"Phase Mode","description":""}},"children":["PhaseMode_B"],"@labels":["Channel A","Channel B"]},"PhaseSpeed_A":{"@parent":"","@translations":{"english":{"name":"Phase Speed","description":""},"korean":{"name":"Phase Speed","description":""},"spanish":{"name":"Phase Speed","description":""},"french":{"name":"Phase Speed","description":""}},"children":["PhaseSpeed_B"],"@labels":["Channel A","Channel B"]},"PhaseModeHold_A":{"@parent":"","@translations":{"english":{"name":"Phase Limit Hold","description":""},"korean":{"name":"","description":""},"spanish":{"name":"Phase Limit Hold","description":""},"french":{"name":"Phase Limit Hold","description":""}},"children":["PhaseModeHold_B"],"@labels":["Channel A","Channel B"]},"PhaseLimitDry_A":{"@parent":"","@translations":{"english":{"name":"Dry Phase Limit","description":""},"korean":{"name":"","description":""},"spanish":{"name":"Dry Phase Limit","description":""},"french":{"name":"Dry Phase Limit","description":""}},"children":["PhaseLimitDry_B"],"@labels":["Channel A","Channel B"]},"PhaseLimitDrySpread_A":{"@parent":"","@translations":{"english":{"name":"Dry Phase Limit Spread","description":""},"korean":{"name":"","description":""},"spanish":{"name":"Dry Phase Limit Spread","description":""},"french":{"name":"Dry Phase Limit Spread","description":""}},"children":["PhaseLimitDrySpread_B"],"@labels":["Channel A","Channel B"]},"PhaseLimitWet_A":{"@parent":"","@translations":{"english":{"name":"Wet Phase Limit","description":""},"korean":{"name":"","description":""},"spanish":{"name":"Wet Phase Limit","description":""},"french":{"name":"Wet Phase Limit","description":""}},"children":["PhaseLimitWet_B"],"@labels":["Channel A","Channel B"]},"PhaseLimitWetSpread_A":{"@parent":"","@translations":{"english":{"name":"Wet Phase Limit Spread","description":""},"korean":{"name":"","description":""},"spanish":{"name":"Wet Phase Limit Spread","description":""},"french":{"name":"Wet Phase Limit Spread","description":""}},"children":["PhaseLimitWetSpread_B"],"@labels":["Channel A","Channel B"]},"PhaseAngleAuto_A":{"@parent":"","@translations":{"english":{"name":"Auto Phase Angle","description":""},"korean":{"name":"Auto Phase Angle","description":""},"spanish":{"name":"Auto Phase Angle","description":""},"french":{"name":"Auto Phase Angle","description":""}},"children":["PhaseAngleAuto_B"],"@labels":["Channel A","Channel B"]},"PhaseFastBit_A":{"@parent":"","@translations":{"english":{"name":"Phase Speed","description":""},"korean":{"name":"Phase Speed","description":""},"spanish":{"name":"Phase Speed","description":""},"french":{"name":"Phase Speed","description":""}},"children":["PhaseFastBit_B"],"@labels":["Channel A","Channel B"]},"PhaseWetBit_A":{"@parent":"","@translations":{"english":{"name":"Phase Wet","description":""},"korean":{"name":"Phase Wet","description":""},"spanish":{"name":"Phase Wet","description":""},"french":{"name":"Phase Wet","description":""}},"children":["PhaseWetBit_B"],"@labels":["Channel A","Channel B"]},"PhaseDSALearn_A":{"@parent":"","@translations":{"english":{"name":"Phase DSA Learn","description":""},"korean":{"name":"Phase DSA Learn","description":""},"spanish":{"name":"Phase DSA Learn","description":""},"french":{"name":"Phase DSA Learn","description":""}},"children":["PhaseDSALearn_B"],"@labels":["Channel A","Channel B"]},"MPhaseOrder_A":{"@parent":"","@translations":{"english":{"name":"M Phase Order","description":""},"korean":{"name":"M Phase Order","description":""},"spanish":{"name":"M Phase Order","description":""},"french":{"name":"M Phase Order","description":""}},"children":["MPhaseOrder_B"],"@labels":["Channel A","Channel B"]},"MPhaseDD_A":{"@parent":"","@translations":{"english":{"name":"M Phase DD","description":""},"korean":{"name":"M Phase DD","description":""},"spanish":{"name":"M Phase DD","description":""},"french":{"name":"M Phase DD","description":""}},"children":["MPhaseDD_B"],"@labels":["Channel A","Channel B"]},"MPhaseRD_A":{"@parent":"","@translations":{"english":{"name":"M Phase RD","description":""},"korean":{"name":"M Phase RD","description":""},"spanish":{"name":"M Phase RD","description":""},"french":{"name":"M Phase RD","description":""}},"children":["MPhaseRD_A"],"@labels":["Channel A","Channel B"]},"Language":{"@parent":"","@translations":{"english":{"name":"Language","description":"This is a description of f the language"},"korean":{"name":"Language","description":"This is a description of f the language"},"spanish":{"name":"Language","description":"This is a description of f the language"},"french":{"name":"Language","description":"This is a description of f the language"}},"children":[],"@labels":["Language"]},"RejDelSec":{"@parent":"","@translations":{"english":{"name":"Main Reject Delay","description":""},"korean":{"name":"Main Reject Delay","description":""},"spanish":{"name":"Main Reject Delay","description":""},"french":{"name":"Main Reject Delay","description":""}},"children":[],"@labels":["Main Reject Delay"]},"RejDelSec2":{"@parent":"","@translations":{"english":{"name":"Alternate Reject Delay","description":""},"korean":{"name":"Alternate Reject Delay","description":""},"spanish":{"name":"Alternate Reject Delay","description":""},"french":{"name":"Alternate Reject Delay","description":""}},"children":[],"@labels":["Alternate Reject Delay"]},"RejDurSec":{"@parent":"","@translations":{"english":{"name":"Main Reject Duration","description":""},"korean":{"name":"Main Reject Duration","description":""},"spanish":{"name":"Main Reject Duration","description":""},"french":{"name":"Main Reject Duration","description":""}},"children":[],"@labels":["Main Reject Duration"]},"RejDurSec2":{"@parent":"","@translations":{"english":{"name":"Alternate Reject Duration","description":""},"korean":{"name":"Alternate Reject Duration","description":""},"spanish":{"name":"Alternate Reject Duration","description":""},"french":{"name":"Alternate Reject Duration","description":""}},"children":[],"@labels":["Alternate Reject Duration"]},"RejMode":{"@parent":"","@translations":{"english":{"name":"Reject Mode","description":""},"korean":{"name":"Reject Mode","description":""},"spanish":{"name":"Reject Mode","description":""},"french":{"name":"Reject Mode","description":""}},"children":[],"@labels":["Reject Mode"]},"RejExitDist":{"@parent":"","@translations":{"english":{"name":"Reject Exit Distance","description":""},"korean":{"name":"Reject Exit Distance","description":""},"spanish":{"name":"Reject Exit Distance","description":""},"french":{"name":"Reject Exit Distance","description":""}},"children":[],"@labels":["Reject Exit Distance"]},"RejExitWin":{"@parent":"","@translations":{"english":{"name":"Reject Exit Window","description":""},"korean":{"name":"Reject Exit Window","description":""},"spanish":{"name":"Reject Exit Window","description":""},"french":{"name":"Reject Exit Window","description":""}},"children":[],"@labels":["Reject Exit Window"]},"AppUnitDist":{"@parent":"","@translations":{"english":{"name":"Units ","description":""},"korean":{"name":"단위 ","description":""},"spanish":{"name":"Units ","description":""},"french":{"name":"Units ","description":""}},"children":[],"@labels":["Units "]},"BeltSpeed":{"@parent":"","@translations":{"english":{"name":"Belt Speed","description":""},"korean":{"name":"Belt Speed","description":""},"spanish":{"name":"Belt Speed","description":""},"french":{"name":"Belt Speed","description":""}},"children":[],"@labels":["Belt Speed"]},"FaultLatch":{"@parent":"","@translations":{"english":{"name":"Fault Latch","description":""},"korean":{"name":"Fault Latch","description":""},"spanish":{"name":"Fault Latch","description":""},"french":{"name":"Fault Latch","description":""}},"children":[],"@labels":["Fault Latch"]},"RejLatchMode":{"@parent":"","@translations":{"english":{"name":"Reject Latch","description":""},"korean":{"name":"Reject Latch","description":""},"spanish":{"name":"Reject Latch","description":""},"french":{"name":"Reject Latch","description":""}},"children":[],"@labels":["Reject Latch"]},"Rej2Latch":{"@parent":"","@translations":{"english":{"name":"Alternate Reject Latch","description":""},"korean":{"name":"Alternate Reject Latch","description":""},"spanish":{"name":"Alternate Reject Latch","description":""},"french":{"name":"Alternate Reject Latch","description":""}},"children":[],"@labels":["Alternate Reject Latch"]},"RejBinDoorTime":{"@parent":"","@translations":{"english":{"name":"Reject Bin Door Time","description":""},"korean":{"name":"Reject Bin Door Time","description":""},"spanish":{"name":"Reject Bin Door Time","description":""},"french":{"name":"Reject Bin Door Time","description":""}},"children":[],"@labels":["Reject Bin Door Time"]},"CIPCycleTime":{"@parent":"","@translations":{"english":{"name":"CIP Cycle Time","description":""},"korean":{"name":"CIP Cycle Time","description":""},"spanish":{"name":"CIP Cycle Time","description":""},"french":{"name":"CIP Cycle Time","description":""}},"children":[],"@labels":["CIP Cycle Time"]},"CIPDwellTime":{"@parent":"","@translations":{"english":{"name":"CIP Dwell Time","description":""},"korean":{"name":"CIP Dwell Time","description":""},"spanish":{"name":"CIP Dwell Time","description":""},"french":{"name":"CIP Dwell Time","description":""}},"children":[],"@labels":["CIP Dwell Time"]},"FaultClearTime":{"@parent":"","@translations":{"english":{"name":"Fault Clear Time","description":""},"korean":{"name":"Fault Clear Time","description":""},"spanish":{"name":"Fault Clear Time","description":""},"french":{"name":"Fault Clear Time","description":""}},"children":[],"@labels":["Fault Clear Time"]},"EyeBlockTime":{"@parent":"","@translations":{"english":{"name":"Eye Block Time","description":""},"korean":{"name":"Eye Block Time","description":""},"spanish":{"name":"Eye Block Time","description":""},"french":{"name":"Eye Block Time","description":""}},"children":[],"@labels":["Eye Block Time"]},"RejCheckTime":{"@parent":"","@translations":{"english":{"name":"Reject Check Time","description":""},"korean":{"name":"Reject Check Time","description":""},"spanish":{"name":"Reject Check Time","description":""},"french":{"name":"Reject Check Time","description":""}},"children":[],"@labels":["Reject Check Time"]},"ExcessRejTime":{"@parent":"","@translations":{"english":{"name":"Excess Reject Time","description":""},"korean":{"name":"Excess Reject Time","description":""},"spanish":{"name":"Excess Reject Time","description":""},"french":{"name":"Excess Reject Time","description":""}},"children":[],"@labels":["Excess Reject Time"]},"RejDelClock":{"@parent":"","@translations":{"english":{"name":"Reject Delay Clock","description":""},"korean":{"name":"Reject Delay Clock","description":""},"spanish":{"name":"Reject Delay Clock","description":""},"french":{"name":"Reject Delay Clock","description":""}},"children":[],"@labels":["Reject Delay Clock"]},"PW1":{"@parent":"","@translations":{"english":{"name":"Password 1","description":""},"korean":{"name":"Password 1","description":""},"spanish":{"name":"Password 1","description":""},"french":{"name":"Password 1","description":""}},"children":[],"@labels":["Password 1"]},"PW2":{"@parent":"","@translations":{"english":{"name":"Password 2","description":""},"korean":{"name":"Password 2","description":""},"spanish":{"name":"Password 2","description":""},"french":{"name":"Password 2","description":""}},"children":[],"@labels":["Password 2"]},"PW3":{"@parent":"","@translations":{"english":{"name":"Password 3","description":""},"korean":{"name":"Password 3","description":""},"spanish":{"name":"Password 3","description":""},"french":{"name":"Password 3","description":""}},"children":[],"@labels":["Password 3"]},"PW4":{"@parent":"","@translations":{"english":{"name":"Password 4","description":""},"korean":{"name":"Password 4","description":""},"spanish":{"name":"Password 4","description":""},"french":{"name":"Password 4","description":""}},"children":[],"@labels":["Password 4"]},"PassAccSens":{"@parent":"","@translations":{"english":{"name":"Sensitivity Access Level","description":""},"korean":{"name":"Sensitivity Access Level","description":""},"spanish":{"name":"Sensitivity Access Level","description":""},"french":{"name":"Sensitivity Access Level","description":""}},"children":[],"@labels":["Sensitivity Access Level"]},"PassAccProd":{"@parent":"","@translations":{"english":{"name":"Product Access Level","description":""},"korean":{"name":"Product Access Level","description":""},"spanish":{"name":"Product Access Level","description":""},"french":{"name":"Product Access Level","description":""}},"children":[],"@labels":["Product Access Level"]},"PassAccCal":{"@parent":"","@translations":{"english":{"name":"Calibrate Access Level","description":""},"korean":{"name":"Calibrate Access Level","description":""},"spanish":{"name":"Calibrate Access Level","description":""},"french":{"name":"Calibrate Access Level","description":""}},"children":[],"@labels":["Calibrate Access Level"]},"PassAccTest":{"@parent":"","@translations":{"english":{"name":"Test Access Level","description":""},"korean":{"name":"Test Access Level","description":""},"spanish":{"name":"Test Access Level","description":""},"french":{"name":"Test Access Level","description":""}},"children":[],"@labels":["Test Access Level"]},"PassAccSelUnit":{"@parent":"","@translations":{"english":{"name":"Select Unit Access Level","description":""},"korean":{"name":"Select Unit Access Level","description":""},"spanish":{"name":"Select Unit Access Level","description":""},"french":{"name":"Select Unit Access Level","description":""}},"children":[],"@labels":["Select Unit Access Level"]},"PassAccClrFaults":{"@parent":"","@translations":{"english":{"name":"Fault Clear Access Level","description":""},"korean":{"name":"Fault Clear Access Level","description":""},"spanish":{"name":"Fault Clear Access Level","description":""},"french":{"name":"Fault Clear Access Level","description":""}},"children":[],"@labels":["Fault Clear Access Level"]},"PassAccClrRej":{"@parent":"","@translations":{"english":{"name":"Reject Clear Access Level","description":""},"korean":{"name":"Reject Clear Access Level","description":""},"spanish":{"name":"Reject Clear Access Level","description":""},"french":{"name":"Reject Clear Access Level","description":""}},"children":[],"@labels":["Reject Clear Access Level"]},"PassAccClrLatch":{"@parent":"","@translations":{"english":{"name":"Latch Clear Access Level","description":""},"korean":{"name":"Latch Clear Access Level","description":""},"spanish":{"name":"Latch Clear Access Level","description":""},"french":{"name":"Latch Clear Access Level","description":""}},"children":[],"@labels":["Latch Clear Access Level"]},"PassAccTime":{"@parent":"","@translations":{"english":{"name":"Time Access Level","description":""},"korean":{"name":"Time Access Level","description":""},"spanish":{"name":"Time Access Level","description":""},"french":{"name":"Time Access Level","description":""}},"children":[],"@labels":["Time Access Level"]},"PassAccSync":{"@parent":"","@translations":{"english":{"name":"Sync Access Level","description":""},"korean":{"name":"Sync Access Level","description":""},"spanish":{"name":"Sync Access Level","description":""},"french":{"name":"Sync Access Level","description":""}},"children":[],"@labels":["Sync Access Level"]},"INPUT_TACH":{"@parent":"","@translations":{"english":{"name":"Tachometer","description":""},"korean":{"name":"Tachometer","description":""},"spanish":{"name":"Tachometer","description":""},"french":{"name":"Tachometer","description":""}},"children":["INPUT_POL_TACH"],"@labels":["Source","Polarity"]},"INPUT_EYE":{"@parent":"","@translations":{"english":{"name":"Photo Eye","description":""},"korean":{"name":"Photo Eye","description":""},"spanish":{"name":"Photo Eye","description":""},"french":{"name":"Photo Eye","description":""}},"children":["INPUT_POL_EYE"],"@labels":["Source","Polarity"]},"INPUT_RC_1":{"@parent":"","@translations":{"english":{"name":"Reject Check 1","description":""},"korean":{"name":"Reject Check 1","description":""},"spanish":{"name":"Reject Check 1","description":""},"french":{"name":"Reject Check 1","description":""}},"children":["INPUT_POL_RC_1"],"@labels":["Source","Polarity"]},"INPUT_RC_2":{"@parent":"","@translations":{"english":{"name":"Reject Check 2","description":""},"korean":{"name":"Reject Check 2","description":""},"spanish":{"name":"Reject Check 2","description":""},"french":{"name":"Reject Check 2","description":""}},"children":["INPUT_POL_RC_2"],"@labels":["Source","Polarity"]},"INPUT_REJ_EYE":{"@parent":"","@translations":{"english":{"name":"Reject Eye","description":""},"korean":{"name":"Reject Eye","description":""},"spanish":{"name":"Reject Eye","description":""},"french":{"name":"Reject Eye","description":""}},"children":["INPUT_POL_REJ_EYE"],"@labels":["Source","Polarity"]},"INPUT_AIR_PRES":{"@parent":"","@translations":{"english":{"name":"Air Pressure","description":""},"korean":{"name":"Air Pressure","description":""},"spanish":{"name":"Air Pressure","description":""},"french":{"name":"Air Pressure","description":""}},"children":["INPUT_POL_AIR_PRES"],"@labels":["Source","Polarity"]},"INPUT_REJ_LATCH":{"@parent":"","@translations":{"english":{"name":"Reject Latch","description":""},"korean":{"name":"Reject Latch","description":""},"spanish":{"name":"Reject Latch","description":""},"french":{"name":"Reject Latch","description":""}},"children":["INPUT_POL_REJ_LATCH"],"@labels":["Source","Polarity"]},"INPUT_BIN_FULL":{"@parent":"","@translations":{"english":{"name":"Bin Full","description":""},"korean":{"name":"Bin Full","description":""},"spanish":{"name":"Bin Full","description":""},"french":{"name":"Bin Full","description":""}},"children":["INPUT_POL_BIN_FULL"],"@labels":["Source","Polarity"]},"INPUT_REJ_PRESENT":{"@parent":"","@translations":{"english":{"name":"Reject Present","description":""},"korean":{"name":"Reject Present","description":""},"spanish":{"name":"Reject Present","description":""},"french":{"name":"Reject Present","description":""}},"children":["INPUT_POL_REJ_PRESENT"],"@labels":["Source","Polarity"]},"INPUT_DOOR1_OPEN":{"@parent":"","@translations":{"english":{"name":"Door 1 Open","description":""},"korean":{"name":"Door 1 Open","description":""},"spanish":{"name":"Door 1 Open","description":""},"french":{"name":"Door 1 Open","description":""}},"children":["INPUT_POL_DOOR1_OPEN"],"@labels":["Source","Polarity"]},"INPUT_DOOR2_OPEN":{"@parent":"","@translations":{"english":{"name":"Door 2 Open","description":""},"korean":{"name":"Door 2 Open","description":""},"spanish":{"name":"Door 2 Open","description":""},"french":{"name":"Door 2 Open","description":""}},"children":["INPUT_POL_DOOR2_OPEN"],"@labels":["Source","Polarity"]},"INPUT_CLEAR_FAULTS":{"@parent":"","@translations":{"english":{"name":"Clear Faults","description":""},"korean":{"name":"Clear Faults","description":""},"spanish":{"name":"Clear Faults","description":""},"french":{"name":"Clear Faults","description":""}},"children":["INPUT_POL_CLEAR_FAULTS"],"@labels":["Source","Polarity"]},"INPUT_CIP":{"@parent":"","@translations":{"english":{"name":"CIP","description":""},"korean":{"name":"CIP","description":""},"spanish":{"name":"CIP","description":""},"french":{"name":"CIP","description":""}},"children":["INPUT_POL_CIP"],"@labels":["Source","Polarity"]},"INPUT_PROD_SEL1":{"@parent":"","@translations":{"english":{"name":"Product Select 1","description":""},"korean":{"name":"Product Select 1","description":""},"spanish":{"name":"Product Select 1","description":""},"french":{"name":"Product Select 1","description":""}},"children":["INPUT_POL_PROD_SEL1"],"@labels":["Source","Polarity"]},"INPUT_PROD_SEL2":{"@parent":"","@translations":{"english":{"name":"Product Select 2","description":""},"korean":{"name":"Product Select 2","description":""},"spanish":{"name":"Product Select 2","description":""},"french":{"name":"Product Select 2","description":""}},"children":["INPUT_POL_PROD_SEL2"],"@labels":["Source","Polarity"]},"INPUT_PROD_SEL3":{"@parent":"","@translations":{"english":{"name":"Product Select 3","description":""},"korean":{"name":"Product Select 3","description":""},"spanish":{"name":"Product Select 3","description":""},"french":{"name":"Product Select 3","description":""}},"children":["INPUT_POL_PROD_SEL3"],"@labels":["Source","Polarity"]},"INPUT_PROD_SEL4":{"@parent":"","@translations":{"english":{"name":"Product Select 4","description":""},"korean":{"name":"Product Select 4","description":""},"spanish":{"name":"Product Select 4","description":""},"french":{"name":"Product Select 4","description":""}},"children":["INPUT_POL_PROD_SEL4"],"@labels":["Source","Polarity"]},"INPUT_TEST":{"@parent":"","@translations":{"english":{"name":"Test","description":""},"korean":{"name":"Test","description":""},"spanish":{"name":"Test","description":""},"french":{"name":"Test","description":""}},"children":["INPUT_POL_TEST"],"@labels":["Source","Polarity"]},"OUT_PHY_PL3_1":{"@parent":"","@translations":{"english":{"name":"PL3 1","description":""},"korean":{"name":"PL3 1","description":""},"spanish":{"name":"PL3 1","description":""},"french":{"name":"PL3 1","description":""}},"children":["OUT_POL_PL3_1"],"@labels":["Source","Polarity"]},"OUT_PHY_PL11_1A2":{"@parent":"","@translations":{"english":{"name":"PL11 1A2","description":""},"korean":{"name":"PL11 1A2","description":""},"spanish":{"name":"PL11 1A2","description":""},"french":{"name":"PL11 1A2","description":""}},"children":["OUT_POL_PL11_1A2"],"@labels":["Source","Polarity"]},"OUT_PHY_PL11_3A4":{"@parent":"","@translations":{"english":{"name":"PL11 3A4","description":""},"korean":{"name":"PL11 3A4","description":""},"spanish":{"name":"PL11 3A4","description":""},"french":{"name":"PL11 3A4","description":""}},"children":["OUT_POL_PL11_3A4"],"@labels":["Source","Polarity"]},"OUT_PHY_PL11_5A6":{"@parent":"","@translations":{"english":{"name":"PL11 5A6","description":""},"korean":{"name":"PL11 5A6","description":""},"spanish":{"name":"PL11 5A6","description":""},"french":{"name":"PL11 5A6","description":""}},"children":["OUT_POL_PL11_5A6"],"@labels":["Source","Polarity"]},"OUT_PHY_PL4_1":{"@parent":"","@translations":{"english":{"name":"PL4 1","description":""},"korean":{"name":"PL4 1","description":""},"spanish":{"name":"PL4 1","description":""},"french":{"name":"PL4 1","description":""}},"children":["OUT_POL_PL4_1"],"@labels":["Source","Polarity"]},"OUT_PHY_PL4_2":{"@parent":"","@translations":{"english":{"name":"PL4 2","description":""},"korean":{"name":"PL4 2","description":""},"spanish":{"name":"PL4 2","description":""},"french":{"name":"PL4 2","description":""}},"children":["OUT_POL_PL4_2"],"@labels":["Source","Polarity"]},"OUT_PHY_PL4_3":{"@parent":"","@translations":{"english":{"name":"PL4 3","description":""},"korean":{"name":"PL4 3","description":""},"spanish":{"name":"PL4 3","description":""},"french":{"name":"PL4 3","description":""}},"children":["OUT_POL_PL4_3"],"@labels":["Source","Polarity"]},"OUT_PHY_PL4_5":{"@parent":"","@translations":{"english":{"name":"PL4 5","description":""},"korean":{"name":"PL4 5","description":""},"spanish":{"name":"PL4 5","description":""},"french":{"name":"PL4 5","description":""}},"children":["OUT_POL_PL4_5"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_R1":{"@parent":"","@translations":{"english":{"name":"IO PL3 R1","description":""},"korean":{"name":"IO PL3 R1","description":""},"spanish":{"name":"IO PL3 R1","description":""},"french":{"name":"IO PL3 R1","description":""}},"children":["OUT_POL_IO_PL3_R1"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_R2":{"@parent":"","@translations":{"english":{"name":"IO PL3 R2","description":""},"korean":{"name":"IO PL3 R2","description":""},"spanish":{"name":"IO PL3 R2","description":""},"french":{"name":"IO PL3 R2","description":""}},"children":["OUT_POL_IO_PL3_R2"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_O1":{"@parent":"","@translations":{"english":{"name":"IO PL3 O1","description":""},"korean":{"name":"IO PL3 O1","description":""},"spanish":{"name":"IO PL3 O1","description":""},"french":{"name":"IO PL3 O1","description":""}},"children":["OUT_POL_IO_PL3_O1"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_O2":{"@parent":"","@translations":{"english":{"name":"IO PL3 O2","description":""},"korean":{"name":"IO PL3 O2","description":""},"spanish":{"name":"IO PL3 O2","description":""},"french":{"name":"IO PL3 O2","description":""}},"children":["OUT_PHY_IO_PL3_O2"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_O3":{"@parent":"","@translations":{"english":{"name":"IO PL3 O3","description":""},"korean":{"name":"IO PL3 O3","description":""},"spanish":{"name":"IO PL3 O3","description":""},"french":{"name":"IO PL3 O3","description":""}},"children":["OUT_POL_IO_PL3_O3"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL4_02":{"@parent":"","@translations":{"english":{"name":"IO PL4 02","description":""},"korean":{"name":"IO PL4 02","description":""},"spanish":{"name":"IO PL4 02","description":""},"french":{"name":"IO PL4 02","description":""}},"children":["OUT_POL_IO_PL4_02"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL4_03":{"@parent":"","@translations":{"english":{"name":"IO PL4 03","description":""},"korean":{"name":"IO PL4 03","description":""},"spanish":{"name":"IO PL4 03","description":""},"french":{"name":"IO PL4 03","description":""}},"children":["OUT_POL_IO_PL4_03"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL4_04":{"@parent":"","@translations":{"english":{"name":"IO PL4 04","description":""},"korean":{"name":"IO PL4 04","description":""},"spanish":{"name":"IO PL4 04","description":""},"french":{"name":"IO PL4 04","description":""}},"children":["OUT_POL_IO_PL4_04"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL4_05":{"@parent":"","@translations":{"english":{"name":"IO PL4 05","description":""},"korean":{"name":"IO PL4 05","description":""},"spanish":{"name":"IO PL4 05","description":""},"french":{"name":"IO PL4 05","description":""}},"children":["OUT_POL_IO_PL4_05"],"@labels":["Source","Polarity"]},"SRecordDate":{"@parent":"","@translations":{"english":{"name":"System Record Date","description":""},"korean":{"name":"System Record Date","description":""},"spanish":{"name":"System Record Date","description":""},"french":{"name":"System Record Date","description":""}},"children":[],"@labels":["System Record Date"]},"ProdNo":{"@parent":"","@translations":{"english":{"name":"Product Number","description":""},"korean":{"name":"Product Number","description":""},"spanish":{"name":"Product Number","description":""},"french":{"name":"Product Number","description":""}},"children":[],"@labels":["Product Number"]},"Unit":{"@parent":"","@translations":{"english":{"name":"Unit","description":""},"korean":{"name":"Unit","description":""},"spanish":{"name":"Unit","description":""},"french":{"name":"Unit","description":""}},"children":[],"@labels":["Unit"]},"RefFaultMask":{"@parent":"","@translations":{"english":{"name":"Reference Fault","description":""},"korean":{"name":"Reference Fault","description":""},"spanish":{"name":"Reference Fault","description":""},"french":{"name":"Reference Fault","description":""}},"children":[],"@labels":["Reference Fault"]},"BalFaultMask":{"@parent":"","@translations":{"english":{"name":"Balance Fault","description":""},"korean":{"name":"Balance Fault","description":""},"spanish":{"name":"Balance Fault","description":""},"french":{"name":"Balance Fault","description":""}},"children":[],"@labels":["Balance Fault"]},"ProdMemFaultMask":{"@parent":"","@translations":{"english":{"name":"Product Memory Fault","description":""},"korean":{"name":"Product Memory Fault","description":""},"spanish":{"name":"Product Memory Fault","description":""},"french":{"name":"Product Memory Fault","description":""}},"children":[],"@labels":["Product Memory Fault"]},"RejConfirmFaultMask":{"@parent":"","@translations":{"english":{"name":"Reject Confirm Fault","description":""},"korean":{"name":"Reject Confirm Fault","description":""},"spanish":{"name":"Reject Confirm Fault","description":""},"french":{"name":"Reject Confirm Fault","description":""}},"children":[],"@labels":["Reject Confirm Fault"]},"PhaseFaultMask":{"@parent":"","@translations":{"english":{"name":"Phase Fault","description":""},"korean":{"name":"Phase Fault","description":""},"spanish":{"name":"Phase Fault","description":""},"french":{"name":"Phase Fault","description":""}},"children":[],"@labels":["Phase Fault"]},"TestSigFaultMask":{"@parent":"","@translations":{"english":{"name":"Test Signal Fault","description":""},"korean":{"name":"Test Signal Fault","description":""},"spanish":{"name":"Test Signal Fault","description":""},"french":{"name":"Test Signal Fault","description":""}},"children":[],"@labels":["Test Signal Fault"]},"PeyeBlockFaultMask":{"@parent":"","@translations":{"english":{"name":"Photoeye Block Fault","description":""},"korean":{"name":"Photoeye Block Fault","description":""},"spanish":{"name":"Photoeye Block Fault","description":""},"french":{"name":"Photoeye Block Fault","description":""}},"children":[],"@labels":["Photoeye Block Fault"]},"RejBinFullFaultMask":{"@parent":"","@translations":{"english":{"name":"Reject Bin Full Fault","description":""},"korean":{"name":"Reject Bin Full Fault","description":""},"spanish":{"name":"Reject Bin Full Fault","description":""},"french":{"name":"Reject Bin Full Fault","description":""}},"children":[],"@labels":["Reject Bin Full Fault"]},"AirFaultMask":{"@parent":"","@translations":{"english":{"name":"Air Fault","description":""},"korean":{"name":"Air Fault","description":""},"spanish":{"name":"Air Fault","description":""},"french":{"name":"Air Fault","description":""}},"children":[],"@labels":["Air Fault"]},"ExcessRejFaultMask":{"@parent":"","@translations":{"english":{"name":"Excess Rejects Fault","description":""},"korean":{"name":"Excess Rejects Fault","description":""},"spanish":{"name":"Excess Rejects Fault","description":""},"french":{"name":"Excess Rejects Fault","description":""}},"children":[],"@labels":["Excess Rejects Fault"]},"BigMetalFaultMask":{"@parent":"","@translations":{"english":{"name":"Large Metal Fault","description":""},"korean":{"name":"Large Metal Fault","description":""},"spanish":{"name":"Large Metal Fault","description":""},"french":{"name":"Large Metal Fault","description":""}},"children":[],"@labels":["Large Metal Fault"]},"NetBufferFaultMask":{"@parent":"","@translations":{"english":{"name":"Net Buffer Fault","description":""},"korean":{"name":"Net Buffer Fault","description":""},"spanish":{"name":"Net Buffer Fault","description":""},"french":{"name":"Net Buffer Fault","description":""}},"children":[],"@labels":["Net Buffer Fault"]},"RejMemoryFaultMask":{"@parent":"","@translations":{"english":{"name":"Reject Memory Fault","description":""},"korean":{"name":"Reject Memory Fault","description":""},"spanish":{"name":"Reject Memory Fault","description":""},"french":{"name":"Reject Memory Fault","description":""}},"children":[],"@labels":["Reject Memory Fault"]},"RejectExitFaultMask":{"@parent":"","@translations":{"english":{"name":"Reject Exit Fault","description":""},"korean":{"name":"Reject Exit Fault","description":""},"spanish":{"name":"Reject Exit Fault","description":""},"french":{"name":"Reject Exit Fault","description":""}},"children":[],"@labels":["Reject Exit Fault"]},"TachometerFaultMask":{"@parent":"","@translations":{"english":{"name":"Tachometer Fault","description":""},"korean":{"name":"Tachometer Fault","description":""},"spanish":{"name":"Tachometer Fault","description":""},"french":{"name":"Tachometer Fault","description":""}},"children":[],"@labels":["Tachometer Fault"]},"PatternFaultMask":{"@parent":"","@translations":{"english":{"name":"Pattern Fault","description":""},"korean":{"name":"Pattern Fault","description":""},"spanish":{"name":"Pattern Fault","description":""},"french":{"name":"Pattern Fault","description":""}},"children":[],"@labels":["Pattern Fault"]},"ExitNoPackFaultMask":{"@parent":"","@translations":{"english":{"name":"Exit No Pack Fault","description":""},"korean":{"name":"Exit No Pack Fault","description":""},"spanish":{"name":"Exit No Pack Fault","description":""},"french":{"name":"Exit No Pack Fault","description":""}},"children":[],"@labels":["Exit No Pack Fault"]},"ExitNewPackFaultMask":{"@parent":"","@translations":{"english":{"name":"Exit New Pack Fault","description":""},"korean":{"name":"Exit New Pack Fault","description":""},"spanish":{"name":"Exit New Pack Fault","description":""},"french":{"name":"Exit New Pack Fault","description":""}},"children":[],"@labels":["Exit New Pack Fault"]},"InterceptorFaultMask":{"@parent":"","@translations":{"english":{"name":"Interceptor Fault","description":""},"korean":{"name":"Interceptor Fault","description":""},"spanish":{"name":"Interceptor Fault","description":""},"french":{"name":"Interceptor Fault","description":""}},"children":[],"@labels":["Interceptor Fault"]},"RtcLowBatFaultMask":{"@parent":"","@translations":{"english":{"name":"Rtc Low Batter Fault","description":""},"korean":{"name":"Rtc Low Batter Fault","description":""},"spanish":{"name":"Rtc Low Batter Fault","description":""},"french":{"name":"Rtc Low Batter Fault","description":""}},"children":[],"@labels":["Rtc Low Batter Fault"]},"RtcTimeFaultMask":{"@parent":"","@translations":{"english":{"name":"Rtc Time Fault","description":""},"korean":{"name":"Rtc Time Fault","description":""},"spanish":{"name":"Rtc Time Fault","description":""},"french":{"name":"Rtc Time Fault","description":""}},"children":[],"@labels":["Rtc Time Fault"]},"IntUsbFaultMask":{"@parent":"","@translations":{"english":{"name":"Int Usb Fault","description":""},"korean":{"name":"Int Usb Fault","description":""},"spanish":{"name":"Int Usb Fault","description":""},"french":{"name":"Int Usb Fault","description":""}},"children":[],"@labels":["Int Usb Fault"]},"IoBoardFaultMask":{"@parent":"","@translations":{"english":{"name":"IO Board Fault","description":""},"korean":{"name":"IO Board Fault","description":""},"spanish":{"name":"IO Board Fault","description":""},"french":{"name":"IO Board Fault","description":""}},"children":[],"@labels":["IO Board Fault"]},"HaloFaultMask":{"@parent":"","@translations":{"english":{"name":"Halo Fault","description":""},"korean":{"name":"Halo Fault","description":""},"spanish":{"name":"Halo Fault","description":""},"french":{"name":"Halo Fault","description":""}},"children":[],"@labels":["Halo Fault"]},"SignalFaultMask":{"@parent":"","@translations":{"english":{"name":"Signal Fault","description":""},"korean":{"name":"Signal Fault","description":""},"spanish":{"name":"Signal Fault","description":""},"french":{"name":"Signal Fault","description":""}},"children":[],"@labels":["Signal Fault"]}},"@netpollsmap":{"NET_POLL_PROTOCOL_VERSION":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_KEY_CLASS_MASK":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_PROD_REC_VAR":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_PROD_SYS_VAR":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_REJECT":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_REJECT2":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_REJ_CNT":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_FAULT":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_CONTROL":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_POWERUP":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_OPERATOR_NO":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_TEST_REQ_PASS":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_REJECT_ID":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_REJECT_CLEAR":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_EYE_PROD_PEAK":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_EYE_PROD_PHASE":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_FAULT_CLEAR":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_SYNC_MENU":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_PWD_ENTRY_1":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_PWD_ENTRY_2":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_SEL_UNIT":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_RESERVED":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_CLEAR_SCOPE":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_REJECT_PHASE":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_FLASH_WRITE":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_INTCPTR_SWITCH":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_PREC_DELETE":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_PREC_DEL_ALL":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_PREC_BACKUP_SAVE":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_PREC_BACKUP_RESTORE":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_PREC_DEAULTS":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_PREC_COPY":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_REJECT2_ID":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}},"NET_POLL_REJECT2_CLEAR":{"@translations":{"english":{"name":{"name":""}},"korean":{"name":{"name":""}},"spanish":{"name":{"name":""}},"french":{"name":{"name":""}}}}},"@pages":{"Sens":{"cat":"Sens","params":["Sens_A","DetThresh_A","ThresProdHi_A","ThresX_A","ThresR_A","BigMetThres_A","DetMode_A","NoiseR_A","NoiseX_A","DetThEst_A"],"subCats":[{"cat":"Filter","params":["NoiseR_A","NoiseX_A","FilterNoise_A"],"subCats":[]},{"cat":"Oscillation Power","params":["OscPower_A"],"subCats":[]},{"cat":"FM Setup","params":["FmInput_A"],"subCats":[]}]},"Test":{"cat":"Test","params":["TestTime","TestDeferTime","TestMode"],"subCats":[{"cat":"Manual","params":["TestConfigCount0_0","TestConfigCount0_1","TestConfigCount0_2","TestConfigCount0_3","TestConfigCount0_4","TestConfigCount0_5","TestConfigAck0","TestConfigOperator0","TestConfigHaloMode0"],"subCats":[]},{"cat":"Halo","params":["TestConfigCount1_0","TestConfigCount1_1","TestConfigCount1_2","TestConfigCount1_3","TestConfigCount1_4","TestConfigCount1_5","TestConfigAck1","TestConfigOperator1","TestConfigHaloMode1"],"subCats":[]},{"cat":"Manual2","params":["TestConfigCount2_0","TestConfigCount2_1","TestConfigCount2_2","TestConfigCount2_3","TestConfigCount2_4","TestConfigCount2_5","TestConfigAck2","TestConfigOperator2","TestConfigHaloMode2"],"subCats":[]},{"cat":"Halo2","params":["TestConfigCount3_0","TestConfigCount3_1","TestConfigCount3_2","TestConfigCount3_3","TestConfigCount3_4","TestConfigCount3_5","TestConfigAck3","TestConfigOperator3","TestConfigHaloMode3"],"subCats":[]},{"cat":"HaloConf","params":["HaloPeakRFe_A","HaloPeakXFe_A","HaloPeakRNFe_A","HaloPeakXNFe_A","HaloPeakRSs_A","HaloPeakXSs_A"],"subCats":[]}]},"Calibration":{"cat":"Calibration","params":[],"subCats":[{"cat":"Phase","params":["PhaseAngle_A","PhaseAngleAuto_A","PhaseMode_A","PhaseSpeed_A","PhaseFastBit_A","PhaseWetBit_A","PhaseDSALearn_A"],"subCats":[]},{"cat":"MPhase","params":["MPhaseOrder_A","MPhaseDD_A","MPhaseRD_A"],"subCats":[]}]}},"@catmap":{"Reject":{"@translations":{"english":"Reject","korean":"거부","spanish":"Reject","french":"Reject"}},"Password":{"@translations":{"english":"Password","korean":"암호","spanish":"Password","french":"Password"}},"IO":{"@translations":{"english":"I/O","korean":"입출력","spanish":"I/O","french":"I/O"}},"System":{"@translations":{"english":"System","korean":"시스템","spanish":"System","french":"System"}},"Fault":{"@translations":{"english":"Faults","korean":"오류","spanish":"Faults","french":"Faults"}},"Reject/Additional Settings":{"@translations":{"english":"Additional Settings","korean":"추가 설정","spanish":"Additional Settings","french":"Additional Settings"}},"Reject/Additional Settings/Distances":{"@translations":{"english":"Distances","korean":"거리","spanish":"Distances","french":"Distances"}},"Reject/Additional Settings/Belt Speed":{"@translations":{"english":"Belt Speed","korean":"벨트 속도","spanish":"Belt Speed","french":"Belt Speed"}},"Reject/Additional Settings/Latch":{"@translations":{"english":"Latches","korean":"Latches","spanish":"Latches","french":"Latches"}},"Reject/Additional Settings/Clocks":{"@translations":{"english":"Clocks","korean":"Clocks","spanish":"Clocks","french":"Clocks"}},"IO/Inputs":{"@translations":{"english":"Inputs","korean":"입력","spanish":"Inputs","french":"Inputs"}},"IO/Outputs":{"@translations":{"english":"Outputs","korean":"출력","spanish":"Outputs","french":"Outputs"}},"Sens":{"@translations":{"english":"Sensitivity","korean":"민감도","spanish":"Sensitivity","french":"Sensitivity"}},"Test":{"@translations":{"english":"Test","korean":"테스트","spanish":"Test","french":"Test"}},"Test/Manual":{"@translations":{"english":"Manual Test 1","korean":"Manual Test 1","spanish":"Manual Test 1","french":"Manual Test 1"}},"Test/Halo":{"@translations":{"english":"Halo Test 1","korean":"Halo Test 1","spanish":"Halo Test 1","french":"Halo Test 1"}},"Test/Manual2":{"@translations":{"english":"Manual Test 2","korean":"Manual Test 2","spanish":"Manual Test 2","french":"Manual Test 2"}},"Test/Halo2":{"@translations":{"english":"Halo Test 2","korean":"Halo Test 2","spanish":"Halo Test 2","french":"Halo Test 2"}},"Test/HaloConf":{"@translations":{"english":"Test Configuration","korean":"Test Configuration","spanish":"Test Configuration","french":"Test Configuration"}},"Sens/Filter":{"@translations":{"english":"Filter Noise","korean":"Filter Noise","spanish":"Filter Noise","french":"Filter Noise"}},"Sens/Oscillation Power":{"@translations":{"english":"Oscillation Power","korean":"Oscillation Power","spanish":"Oscillation Power","french":"Oscillation Power"}},"Sens/FM Setup":{"@translations":{"english":"FM Setup","korean":"FM Setup","spanish":"FM Setup","french":"FM Setup"}},"Calibration":{"@translations":{"english":"Calibration","korean":"Calibration","spanish":"Calibration","french":"Calibration"}},"Calibration/Phase":{"@translations":{"english":"Phase","korean":"Phase","spanish":"Phase","french":"Phase"}},"Calibration/MPhase":{"@translations":{"english":"M Phase","korean":"M Phase","spanish":"M Phase","french":"M Phase"}}},"@languages":["english","korean","spanish","french"],"@labels":{"Channel A":{"english":{"name":"Channel A"},"korean":{"name":"Channel A"},"spanish":{"name":"Channel A"},"french":{"name":"chaîne A"}},"Channel B":{"english":{"name":"Channel B"},"korean":{"name":"Channel B"},"spanish":{"name":"Channel B"},"french":{"name":"chaîne B"}},"Count":{"english":{"name":"Count"},"korean":{"name":"Count"},"spanish":{"name":"Count"},"french":{"name":"nombre"}},"Metal Type":{"english":{"name":"Metal Type"},"korean":{"name":"Metal Type"},"spanish":{"name":"Metal Type"},"french":{"name":"type de métal"}},"Signal Chain":{"english":{"name":"Signal Chain"},"korean":{"name":"Signal Chain"},"spanish":{"name":"Signal Chain"},"french":{"name":"chaîne de signal"}},"Source":{"english":{"name":"Source"},"korean":{"name":"Source"},"spanish":{"name":"Source"},"french":{"name":"source"}},"Polarity":{"english":{"name":"Polarity"},"korean":{"name":"Polarity"},"spanish":{"name":"Polarity"},"french":{"name":"polarité"}},"Sensitivity":{"english":{"name":"Sensitivity"},"korean":{"name":"민감도"},"spanish":{"name":"sensibildad"},"french":{"name":" sensibilité"}},"Signal":{"english":{"name":"Signal"},"korean":{"name":"신호"},"spanish":{"name":"señal"},"french":{"name":"signal"}},"Rejects":{"english":{"name":"Rejects"},"korean":{"name":"거부"},"spanish":{"name":"rechaza"},"french":{"name":"rejet"}},"Settings":{"english":{"name":"Settings"},"korean":{"name":"설정"},"spanish":{"name":"ajustes"},"french":{"name":" paramètres"}},"Test":{"english":{"name":"Test"},"korean":{"name":"테스트"},"spanish":{"name":"Test"},"french":{"name":"test"}},"Log":{"english":{"name":"Log"},"korean":{"name":"기록"},"spanish":{"name":"Log"},"french":{"name":"le registre"}},"Calibrate":{"english":{"name":"Calibrate"},"korean":{"name":"조정"},"spanish":{"name":"Calibrate"},"french":{"name":"calibrer"}},"Product":{"english":{"name":"Product"},"korean":{"name":"품목"},"spanish":{"name":"producto"},"french":{"name":"produit"}},"Running Product":{"english":{"name":"Running Product"},"korean":{"name":"현 품목"},"spanish":{"name":"Running Product"},"french":{"name":"produit courant"}},"Select Test":{"english":{"name":"Select Test"},"korean":{"name":"테스트 선택"},"spanish":{"name":"Select Test"},"french":{"name":"Select Test"}},"Currently Running":{"english":{"name":"Currently Running"},"korean":{"name":"실행중"},"spanish":{"name":"Currently Running"},"french":{"name":"Currently Running"}},"Quit Test":{"english":{"name":"Quit Test"},"korean":{"name":"테스트 중단"},"spanish":{"name":"Quit Test"},"french":{"name":"Quit Test"}},"activate":{"english":{"name":"activate"},"korean":{"name":"activate"},"spanish":{"name":"activate"},"french":{"name":"activate"}},"Clear Faults":{"english":{"name":"Clear Faults"},"korean":{"name":"Clear Faults"},"spanish":{"name":"Clear Faults"},"french":{"name":"Clear Faults"}},"No Faults":{"english":{"name":"No Faults"},"korean":{"name":"No Faults"},"spanish":{"name":"No Faults"},"french":{"name":"No Faults"}},"Calibrate All":{"english":{"name":"Calibrate All"},"korean":{"name":"전부 조정"},"spanish":{"name":"Calibrate All"},"french":{"name":"Calibrate All"}}}
}
/*var vdefMapV2 = {
	"@categories":{"cat":"@root","params":["Language"],"subCats":[{"cat":"Reject","params":["RejDelSec","RejDelSec2","RejDurSec","RejDurSec2","RejMode"],"subCats":[{"cat":"Additional Settings","params":[],"subCats":[{"cat":"Distances","params":["RejExitDist","RejExitWin","AppUnitDist"],"subCats":[]},{"cat":"Belt Speed","params":["BeltSpeed"],"subCats":[]},{"cat":"Latch","params":["FaultLatch","RejLatchMode","Rej2Latch"],"subCats":[]},{"cat":"Clocks","params":["RejBinDoorTime","CIPCycleTime","CIPDwellTime","FaultClearTime","EyeBlockTime","RejCheckTime","ExcessRejTime","RejDelClock"],"subCats":[]}]}]},{"cat":"Password","params":["PW1","PW2","PW3","PW4","PassAccSens","PassAccProd","PassAccCal","PassAccTest","PassAccSelUnit","PassAccClrFaults","PassAccClrRej","PassAccClrLatch","PassAccTime","PassAccSync"],"subCats":[]},{"cat":"IO","params":[],"subCats":[{"cat":"Inputs","params":["INPUT_TACH","INPUT_EYE","INPUT_RC_1","INPUT_RC_2","INPUT_REJ_EYE","INPUT_AIR_PRES","INPUT_REJ_LATCH","INPUT_BIN_FULL","INPUT_REJ_PRESENT","INPUT_DOOR1_OPEN","INPUT_DOOR2_OPEN","INPUT_CLEAR_FAULTS","INPUT_CIP","INPUT_PROD_SEL1","INPUT_PROD_SEL2","INPUT_PROD_SEL3","INPUT_PROD_SEL4","INPUT_TEST"],"subCats":[]},{"cat":"Outputs","params":["OUT_PHY_PL3_1","OUT_PHY_PL11_1A2","OUT_PHY_PL11_3A4","OUT_PHY_PL11_5A6","OUT_PHY_PL4_1","OUT_PHY_PL4_2","OUT_PHY_PL4_3","OUT_PHY_PL4_5","OUT_PHY_IO_PL3_R1","OUT_PHY_IO_PL3_R2","OUT_PHY_IO_PL3_O1","OUT_PHY_IO_PL3_O2","OUT_PHY_IO_PL3_O3","OUT_PHY_IO_PL4_02","OUT_PHY_IO_PL4_03","OUT_PHY_IO_PL4_04","OUT_PHY_IO_PL4_05"],"subCats":[]}]},{"cat":"System","params":["SRecordDate","ProdNo","Unit"],"subCats":[]},{"cat":"Fault","params":["RefFaultMask","BalFaultMask","ProdMemFaultMask","RejConfirmFaultMask","PhaseFaultMask","TestSigFaultMask","PeyeBlockFaultMask","RejBinFullFaultMask","AirFaultMask","ExcessRejFaultMask","BigMetalFaultMask","NetBufferFaultMask","RejMemoryFaultMask","RejectExitFaultMask","TachometerFaultMask","PatternFaultMask","ExitNoPackFaultMask","ExitNewPackFaultMask","InterceptorFaultMask","RtcLowBatFaultMask","RtcTimeFaultMask","IntUsbFaultMask","IoBoardFaultMask","HaloFaultMask","SignalFaultMask"],"subCats":[]}]},"@vMap":{"Sens_A":{"@parent":"","@translations":{"english":{"name":"Sensitivity","description":""},"korean":{"name":"민감도","description":""},"spanish":{"name":"Sensitivity","description":""}},"children":["Sens_B"],"@labels":["Channel A","Channel B"]},"DetThresh_A":{"@parent":"","@translations":{"english":{"name":"Detection Threshold","description":""},"korean":{"name":"검출역치 ","description":""},"spanish":{"name":"Detection Threshold","description":""}},"children":["DetThresh_B"],"@labels":["Channel A","Channel B"]},"ThresProdHi_A":{"@parent":"","@translations":{"english":{"name":"Product High Threshold","description":""},"korean":{"name":"교정한계치","description":""},"spanish":{"name":"Product High Threshold","description":""}},"children":["ThresProdHi_B"],"@labels":["Channel A","Channel B"]},"ThresX_A":{"@parent":"","@translations":{"english":{"name":"X Threshold","description":""},"korean":{"name":"X 역치","description":""},"spanish":{"name":"X Threshold","description":""}},"children":["ThresX_B"],"@labels":["Channel A","Channel B"]},"ThresR_A":{"@parent":"","@translations":{"english":{"name":"R Threshold","description":""},"korean":{"name":"R 역치","description":""},"spanish":{"name":"R Threshold","description":""}},"children":["ThresR_B"],"@labels":["Channel A","Channel B"]},"BigMetThres_A":{"@parent":"","@translations":{"english":{"name":"Large Metal Threshold","description":""},"korean":{"name":"대량금속 역치","description":""},"spanish":{"name":"Large Metal Threshold","description":""}},"children":["BigMetThres_B"],"@labels":["Channel A","Channel B"]},"DetMode_A":{"@parent":"","@translations":{"english":{"name":"Detection Mode","description":""},"korean":{"name":"검출방식","description":""},"spanish":{"name":"Detection Mode","description":""}},"children":["DetMode_B"],"@labels":["Channel A","Channel B"]},"NoiseR_A":{"@parent":"","@translations":{"english":{"name":"R Channel Noise","description":""},"korean":{"name":"R 채널 노이즈","description":""},"spanish":{"name":"R Channel Noise","description":""}},"children":["NoiseR_B"],"@labels":["Channel A","Channel B"]},"NoiseX_A":{"@parent":"","@translations":{"english":{"name":"X Channel Noise","description":""},"korean":{"name":"X 채널 노이즈","description":""},"spanish":{"name":"X Channel Noise","description":""}},"children":["NoiseX_B"],"@labels":["Channel A","Channel B"]},"DetThEst_A":{"@parent":"","@translations":{"english":{"name":"Detection Threshold Est","description":""},"korean":{"name":"검출역치 추정값","description":""},"spanish":{"name":"Detection Threshold Est","description":""}},"children":["DetThEst_B"],"@labels":["Channel A","Channel B"]},"FilterNoise_A":{"@parent":"","@translations":{"english":{"name":"Filter Noise","description":""},"korean":{"name":"필터 노이즈","description":""},"spanish":{"name":"Filter Noise","description":""}},"children":["FilterNoise_B"],"@labels":["Channel A","Channel B"]},"OscPower_A":{"@parent":"","@translations":{"english":{"name":"Oscillation Power","description":""},"korean":{"name":"진동 출력","description":""},"spanish":{"name":"Oscillation Power","description":""}},"children":["OscPower_B"],"@labels":["Channel A","Channel B"]},"FmInput_A":{"@parent":"","@translations":{"english":{"name":"FM Input ","description":""},"korean":{"name":"FM 입력","description":""},"spanish":{"name":"FM Input ","description":""}},"children":["FmInput_B"],"@labels":["Channel A","Channel B"]},"TestTime":{"@parent":"","@translations":{"english":{"name":"Test Interval","description":""},"korean":{"name":"테스트 간격","description":""},"spanish":{"name":"Test Interval","description":""}},"children":[],"@labels":["Test Interval"]},"TestDeferTime":{"@parent":"","@translations":{"english":{"name":"Test Defer TIme","description":""},"korean":{"name":"테스트 지연 시간","description":""},"spanish":{"name":"Test Defer TIme","description":""}},"children":[],"@labels":["Test Defer TIme"]},"TestMode":{"@parent":"","@translations":{"english":{"name":"Test Mode","description":""},"korean":{"name":"테스트 방식","description":""},"spanish":{"name":"Test Mode","description":""}},"children":[],"@labels":["Test Mode"]},"TestConfigCount0_0":{"@parent":"","@translations":{"english":{"name":"Test 1","description":"Count is number of passes. Select Metal Type to test on the specified signal chain"},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":"Count is number of passes. Select Metal Type to test on the specified signal chain"}},"children":["TestConfigMetal0_0","TestConfigFreq0_0"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount0_1":{"@parent":"","@translations":{"english":{"name":"Test 2","description":""},"korean":{"name":"Test 2","description":""},"spanish":{"name":"Test 2","description":""}},"children":["TestConfigMetal0_1","TestConfigFreq0_1"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount0_2":{"@parent":"","@translations":{"english":{"name":"Test 3","description":""},"korean":{"name":"Test 3","description":""},"spanish":{"name":"Test 3","description":""}},"children":["TestConfigMetal0_2","TestConfigFreq0_2"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount0_3":{"@parent":"","@translations":{"english":{"name":"Test 4","description":""},"korean":{"name":"Test 4","description":""},"spanish":{"name":"Test 4","description":""}},"children":["TestConfigMetal0_3","TestConfigFreq0_3"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount0_4":{"@parent":"","@translations":{"english":{"name":"Test 5","description":""},"korean":{"name":"Test 5","description":""},"spanish":{"name":"Test 5","description":""}},"children":["TestConfigMetal0_4","TestConfigFreq0_4"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount0_5":{"@parent":"","@translations":{"english":{"name":"Test 6","description":""},"korean":{"name":"Test 6","description":""},"spanish":{"name":"Test 6","description":""}},"children":["TestConfigMetal0_5","TestConfigFreq0_5"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigAck0":{"@parent":"","@translations":{"english":{"name":"Acknowledge","description":""},"korean":{"name":"확인","description":""},"spanish":{"name":"Acknowledge","description":""}},"children":[],"@labels":["Acknowledge"]},"TestConfigOperator0":{"@parent":"","@translations":{"english":{"name":"Operator","description":""},"korean":{"name":"Operator","description":""},"spanish":{"name":"Operator","description":""}},"children":[],"@labels":["Operator"]},"TestConfigHaloMode0":{"@parent":"","@translations":{"english":{"name":"Halo Mode","description":""},"korean":{"name":"Halo Mode","description":""},"spanish":{"name":"Halo Mode","description":""}},"children":[],"@labels":["Halo Mode"]},"TestConfigCount1_0":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal1_0","TestConfigFreq1_0"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount1_1":{"@parent":"","@translations":{"english":{"name":"Test 2","description":""},"korean":{"name":"Test 2","description":""},"spanish":{"name":"Test 2","description":""}},"children":["TestConfigMetal1_1","TestConfigFreq1_1"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount1_2":{"@parent":"","@translations":{"english":{"name":"Test 3","description":""},"korean":{"name":"Test 3","description":""},"spanish":{"name":"Test 3","description":""}},"children":["TestConfigMetal1_2","TestConfigFreq1_2"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount1_3":{"@parent":"","@translations":{"english":{"name":"Test 4","description":""},"korean":{"name":"Test 4","description":""},"spanish":{"name":"Test 4","description":""}},"children":["TestConfigMetal1_3","TestConfigFreq1_3"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount1_4":{"@parent":"","@translations":{"english":{"name":"Test 5","description":""},"korean":{"name":"Test 5","description":""},"spanish":{"name":"Test 5","description":""}},"children":["TestConfigMetal1_4","TestConfigFreq1_4"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount1_5":{"@parent":"","@translations":{"english":{"name":"Test 6","description":""},"korean":{"name":"Test 6","description":""},"spanish":{"name":"Test 6","description":""}},"children":["TestConfigMetal1_5","TestConfigFreq1_5"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigAck1":{"@parent":"","@translations":{"english":{"name":"Acknowledge","description":""},"korean":{"name":"Acknowledge","description":""},"spanish":{"name":"Acknowledge","description":""}},"children":[],"@labels":["Acknowledge"]},"TestConfigOperator1":{"@parent":"","@translations":{"english":{"name":"Operator","description":""},"korean":{"name":"Operator","description":""},"spanish":{"name":"Operator","description":""}},"children":[],"@labels":["Operator"]},"TestConfigHaloMode1":{"@parent":"","@translations":{"english":{"name":"Halo Mode","description":""},"korean":{"name":"Halo Mode","description":""},"spanish":{"name":"Halo Mode","description":""}},"children":[],"@labels":["Halo Mode"]},"TestConfigCount2_0":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_0","TestConfigFreq2_0"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount2_1":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_1","TestConfigFreq2_1"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount2_2":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_2","TestConfigFreq2_2"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount2_3":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_3","TestConfigFreq2_3"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount2_4":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_4","TestConfigFreq2_4"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount2_5":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_5","TestConfigFreq2_5"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigAck2":{"@parent":"","@translations":{"english":{"name":"Acknowledge","description":""},"korean":{"name":"Acknowledge","description":""},"spanish":{"name":"Acknowledge","description":""}},"children":[],"@labels":["Acknowledge"]},"TestConfigOperator2":{"@parent":"","@translations":{"english":{"name":"Operator","description":""},"korean":{"name":"Operator","description":""},"spanish":{"name":"Operator","description":""}},"children":[],"@labels":["Operator"]},"TestConfigHaloMode2":{"@parent":"","@translations":{"english":{"name":"Halo Mode","description":""},"korean":{"name":"Halo Mode","description":""},"spanish":{"name":"Halo Mode","description":""}},"children":[],"@labels":["Halo Mode"]},"TestConfigCount3_0":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_0","TestConfigFreq3_0"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount3_1":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_1","TestConfigFreq3_1"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount3_2":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_2","TestConfigFreq3_2"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount3_3":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_3","TestConfigFreq3_3"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount3_4":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_4","TestConfigFreq3_4"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigCount3_5":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""},"korean":{"name":"Test 1","description":""},"spanish":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_5","TestConfigFreq3_5"],"@labels":["Count","Metal Type","Signal Chain"]},"TestConfigAck3":{"@parent":"","@translations":{"english":{"name":"Acknowledge","description":""},"korean":{"name":"Acknowledge","description":""},"spanish":{"name":"Acknowledge","description":""}},"children":[],"@labels":["Acknowledge"]},"TestConfigOperator3":{"@parent":"","@translations":{"english":{"name":"Operator","description":""},"korean":{"name":"Operator","description":""},"spanish":{"name":"Operator","description":""}},"children":[],"@labels":["Operator"]},"TestConfigHaloMode3":{"@parent":"","@translations":{"english":{"name":"Halo Mode","description":""},"korean":{"name":"Halo Mode","description":""},"spanish":{"name":"Halo Mode","description":""}},"children":[],"@labels":["Halo Mode"]},"HaloPeakRFe_A":{"@parent":"","@translations":{"english":{"name":"Ferrous R Peak","description":""},"korean":{"name":"Ferrous R Peak","description":""},"spanish":{"name":"Ferrous R Peak","description":""}},"children":["HaloPeakRFe_B"],"@labels":["Channel A","Channel B"]},"HaloPeakXFe_A":{"@parent":"","@translations":{"english":{"name":"Ferrous X Peak","description":""},"korean":{"name":"Ferrous X Peak","description":""},"spanish":{"name":"Ferrous X Peak","description":""}},"children":["HaloPeakXFe_B"],"@labels":["Channel A","Channel B"]},"HaloPeakRNFe_A":{"@parent":"","@translations":{"english":{"name":"Non-Ferrous R Peak","description":""},"korean":{"name":"Non-Ferrous R Peak","description":""},"spanish":{"name":"Non-Ferrous R Peak","description":""}},"children":["HaloPeakRNFe_B"],"@labels":["Channel A","Channel B"]},"HaloPeakXNFe_A":{"@parent":"","@translations":{"english":{"name":"Non-Ferrous X Peak","description":""},"korean":{"name":"Non-Ferrous X Peak","description":""},"spanish":{"name":"Non-Ferrous X Peak","description":""}},"children":["HaloPeakXNFe_B"],"@labels":["Channel A","Channel B"]},"HaloPeakRSs_A":{"@parent":"","@translations":{"english":{"name":"Stainless R Peak","description":""},"korean":{"name":"Stainless R Peak","description":""},"spanish":{"name":"Stainless R Peak","description":""}},"children":["HaloPeakRSs_B"],"@labels":["Channel A","Channel B"]},"HaloPeakXSs_A":{"@parent":"","@translations":{"english":{"name":"Stainless X Peak","description":""},"korean":{"name":"Stainless X Peak","description":""},"spanish":{"name":"Stainless X Peak","description":""}},"children":["HaloPeakXSs_B"],"@labels":["Channel A","Channel B"]},"PhaseAngle_A":{"@parent":"","@translations":{"english":{"name":"Phase Angle","description":""},"korean":{"name":"Phase Angle","description":""},"spanish":{"name":"Phase Angle","description":""}},"children":["PhaseAngle_B"],"@labels":["Channel A","Channel B"]},"PhaseMode_A":{"@parent":"","@translations":{"english":{"name":"Phase Mode","description":""},"korean":{"name":"Phase Mode","description":""},"spanish":{"name":"Phase Mode","description":""}},"children":["PhaseMode_B"],"@labels":["Channel A","Channel B"]},"PhaseSpeed_A":{"@parent":"","@translations":{"english":{"name":"Phase Speed","description":""},"korean":{"name":"Phase Speed","description":""},"spanish":{"name":"Phase Speed","description":""}},"children":["PhaseSpeed_B"],"@labels":["Channel A","Channel B"]},"PhaseModeHold_A":{"@parent":"","@translations":{"english":{"name":"Phase Limit Hold","description":""},"korean":{"name":"","description":""},"spanish":{"name":"Phase Limit Hold","description":""}},"children":["PhaseModeHold_B"],"@labels":["Channel A","Channel B"]},"PhaseLimitDry_A":{"@parent":"","@translations":{"english":{"name":"Dry Phase Limit","description":""},"korean":{"name":"","description":""},"spanish":{"name":"Dry Phase Limit","description":""}},"children":["PhaseLimitDry_B"],"@labels":["Channel A","Channel B"]},"PhaseLimitDrySpread_A":{"@parent":"","@translations":{"english":{"name":"Dry Phase Limit Spread","description":""},"korean":{"name":"","description":""},"spanish":{"name":"Dry Phase Limit Spread","description":""}},"children":["PhaseLimitDrySpread_B"],"@labels":["Channel A","Channel B"]},"PhaseLimitWet_A":{"@parent":"","@translations":{"english":{"name":"Wet Phase Limit","description":""},"korean":{"name":"","description":""},"spanish":{"name":"Wet Phase Limit","description":""}},"children":["PhaseLimitWet_B"],"@labels":["Channel A","Channel B"]},"PhaseLimitWetSpread_A":{"@parent":"","@translations":{"english":{"name":"Wet Phase Limit Spread","description":""},"korean":{"name":"","description":""},"spanish":{"name":"Wet Phase Limit Spread","description":""}},"children":["PhaseLimitWetSpread_B"],"@labels":["Channel A","Channel B"]},"PhaseAngleAuto_A":{"@parent":"","@translations":{"english":{"name":"Auto Phase Angle","description":""},"korean":{"name":"Auto Phase Angle","description":""},"spanish":{"name":"Auto Phase Angle","description":""}},"children":["PhaseAngleAuto_B"],"@labels":["Channel A","Channel B"]},"PhaseFastBit_A":{"@parent":"","@translations":{"english":{"name":"Phase Speed","description":""},"korean":{"name":"Phase Speed","description":""},"spanish":{"name":"Phase Speed","description":""}},"children":["PhaseFastBit_B"],"@labels":["Channel A","Channel B"]},"PhaseWetBit_A":{"@parent":"","@translations":{"english":{"name":"Phase Wet","description":""},"korean":{"name":"Phase Wet","description":""},"spanish":{"name":"Phase Wet","description":""}},"children":["PhaseWetBit_B"],"@labels":["Channel A","Channel B"]},"PhaseDSALearn_A":{"@parent":"","@translations":{"english":{"name":"Phase DSA Learn","description":""},"korean":{"name":"Phase DSA Learn","description":""},"spanish":{"name":"Phase DSA Learn","description":""}},"children":["PhaseDSALearn_B"],"@labels":["Channel A","Channel B"]},"MPhaseOrder_A":{"@parent":"","@translations":{"english":{"name":"M Phase Order","description":""},"korean":{"name":"M Phase Order","description":""},"spanish":{"name":"M Phase Order","description":""}},"children":["MPhaseOrder_B"],"@labels":["Channel A","Channel B"]},"MPhaseDD_A":{"@parent":"","@translations":{"english":{"name":"M Phase DD","description":""},"korean":{"name":"M Phase DD","description":""},"spanish":{"name":"M Phase DD","description":""}},"children":["MPhaseDD_B"],"@labels":["Channel A","Channel B"]},"MPhaseRD_A":{"@parent":"","@translations":{"english":{"name":"M Phase RD","description":""},"korean":{"name":"M Phase RD","description":""},"spanish":{"name":"M Phase RD","description":""}},"children":["MPhaseRD_A"],"@labels":["Channel A","Channel B"]},"Language":{"@parent":"","@translations":{"english":{"name":"Language","description":"This is a description of f the language"},"korean":{"name":"Language","description":"This is a description of f the language"},"spanish":{"name":"Language","description":"This is a description of f the language"}},"children":[],"@labels":["Language"]},"RejDelSec":{"@parent":"","@translations":{"english":{"name":"Main Reject Delay","description":""},"korean":{"name":"Main Reject Delay","description":""},"spanish":{"name":"Main Reject Delay","description":""}},"children":[],"@labels":["Main Reject Delay"]},"RejDelSec2":{"@parent":"","@translations":{"english":{"name":"Alternate Reject Delay","description":""},"korean":{"name":"Alternate Reject Delay","description":""},"spanish":{"name":"Alternate Reject Delay","description":""}},"children":[],"@labels":["Alternate Reject Delay"]},"RejDurSec":{"@parent":"","@translations":{"english":{"name":"Main Reject Duration","description":""},"korean":{"name":"Main Reject Duration","description":""},"spanish":{"name":"Main Reject Duration","description":""}},"children":[],"@labels":["Main Reject Duration"]},"RejDurSec2":{"@parent":"","@translations":{"english":{"name":"Alternate Reject Duration","description":""},"korean":{"name":"Alternate Reject Duration","description":""},"spanish":{"name":"Alternate Reject Duration","description":""}},"children":[],"@labels":["Alternate Reject Duration"]},"RejMode":{"@parent":"","@translations":{"english":{"name":"Reject Mode","description":""},"korean":{"name":"Reject Mode","description":""},"spanish":{"name":"Reject Mode","description":""}},"children":[],"@labels":["Reject Mode"]},"RejExitDist":{"@parent":"","@translations":{"english":{"name":"Reject Exit Distance","description":""},"korean":{"name":"Reject Exit Distance","description":""},"spanish":{"name":"Reject Exit Distance","description":""}},"children":[],"@labels":["Reject Exit Distance"]},"RejExitWin":{"@parent":"","@translations":{"english":{"name":"Reject Exit Window","description":""},"korean":{"name":"Reject Exit Window","description":""},"spanish":{"name":"Reject Exit Window","description":""}},"children":[],"@labels":["Reject Exit Window"]},"AppUnitDist":{"@parent":"","@translations":{"english":{"name":"Units ","description":""},"korean":{"name":"단위 ","description":""},"spanish":{"name":"Units ","description":""}},"children":[],"@labels":["Units "]},"BeltSpeed":{"@parent":"","@translations":{"english":{"name":"Belt Speed","description":""},"korean":{"name":"Belt Speed","description":""},"spanish":{"name":"Belt Speed","description":""}},"children":[],"@labels":["Belt Speed"]},"FaultLatch":{"@parent":"","@translations":{"english":{"name":"Fault Latch","description":""},"korean":{"name":"Fault Latch","description":""},"spanish":{"name":"Fault Latch","description":""}},"children":[],"@labels":["Fault Latch"]},"RejLatchMode":{"@parent":"","@translations":{"english":{"name":"Reject Latch","description":""},"korean":{"name":"Reject Latch","description":""},"spanish":{"name":"Reject Latch","description":""}},"children":[],"@labels":["Reject Latch"]},"Rej2Latch":{"@parent":"","@translations":{"english":{"name":"Alternate Reject Latch","description":""},"korean":{"name":"Alternate Reject Latch","description":""},"spanish":{"name":"Alternate Reject Latch","description":""}},"children":[],"@labels":["Alternate Reject Latch"]},"RejBinDoorTime":{"@parent":"","@translations":{"english":{"name":"Reject Bin Door Time","description":""},"korean":{"name":"Reject Bin Door Time","description":""},"spanish":{"name":"Reject Bin Door Time","description":""}},"children":[],"@labels":["Reject Bin Door Time"]},"CIPCycleTime":{"@parent":"","@translations":{"english":{"name":"CIP Cycle Time","description":""},"korean":{"name":"CIP Cycle Time","description":""},"spanish":{"name":"CIP Cycle Time","description":""}},"children":[],"@labels":["CIP Cycle Time"]},"CIPDwellTime":{"@parent":"","@translations":{"english":{"name":"CIP Dwell Time","description":""},"korean":{"name":"CIP Dwell Time","description":""},"spanish":{"name":"CIP Dwell Time","description":""}},"children":[],"@labels":["CIP Dwell Time"]},"FaultClearTime":{"@parent":"","@translations":{"english":{"name":"Fault Clear Time","description":""},"korean":{"name":"Fault Clear Time","description":""},"spanish":{"name":"Fault Clear Time","description":""}},"children":[],"@labels":["Fault Clear Time"]},"EyeBlockTime":{"@parent":"","@translations":{"english":{"name":"Eye Block Time","description":""},"korean":{"name":"Eye Block Time","description":""},"spanish":{"name":"Eye Block Time","description":""}},"children":[],"@labels":["Eye Block Time"]},"RejCheckTime":{"@parent":"","@translations":{"english":{"name":"Reject Check Time","description":""},"korean":{"name":"Reject Check Time","description":""},"spanish":{"name":"Reject Check Time","description":""}},"children":[],"@labels":["Reject Check Time"]},"ExcessRejTime":{"@parent":"","@translations":{"english":{"name":"Excess Reject Time","description":""},"korean":{"name":"Excess Reject Time","description":""},"spanish":{"name":"Excess Reject Time","description":""}},"children":[],"@labels":["Excess Reject Time"]},"RejDelClock":{"@parent":"","@translations":{"english":{"name":"Reject Delay Clock","description":""},"korean":{"name":"Reject Delay Clock","description":""},"spanish":{"name":"Reject Delay Clock","description":""}},"children":[],"@labels":["Reject Delay Clock"]},"PW1":{"@parent":"","@translations":{"english":{"name":"Password 1","description":""},"korean":{"name":"Password 1","description":""},"spanish":{"name":"Password 1","description":""}},"children":[],"@labels":["Password 1"]},"PW2":{"@parent":"","@translations":{"english":{"name":"Password 2","description":""},"korean":{"name":"Password 2","description":""},"spanish":{"name":"Password 2","description":""}},"children":[],"@labels":["Password 2"]},"PW3":{"@parent":"","@translations":{"english":{"name":"Password 3","description":""},"korean":{"name":"Password 3","description":""},"spanish":{"name":"Password 3","description":""}},"children":[],"@labels":["Password 3"]},"PW4":{"@parent":"","@translations":{"english":{"name":"Password 4","description":""},"korean":{"name":"Password 4","description":""},"spanish":{"name":"Password 4","description":""}},"children":[],"@labels":["Password 4"]},"PassAccSens":{"@parent":"","@translations":{"english":{"name":"Sensitivity Access Level","description":""},"korean":{"name":"Sensitivity Access Level","description":""},"spanish":{"name":"Sensitivity Access Level","description":""}},"children":[],"@labels":["Sensitivity Access Level"]},"PassAccProd":{"@parent":"","@translations":{"english":{"name":"Product Access Level","description":""},"korean":{"name":"Product Access Level","description":""},"spanish":{"name":"Product Access Level","description":""}},"children":[],"@labels":["Product Access Level"]},"PassAccCal":{"@parent":"","@translations":{"english":{"name":"Calibrate Access Level","description":""},"korean":{"name":"Calibrate Access Level","description":""},"spanish":{"name":"Calibrate Access Level","description":""}},"children":[],"@labels":["Calibrate Access Level"]},"PassAccTest":{"@parent":"","@translations":{"english":{"name":"Test Access Level","description":""},"korean":{"name":"Test Access Level","description":""},"spanish":{"name":"Test Access Level","description":""}},"children":[],"@labels":["Test Access Level"]},"PassAccSelUnit":{"@parent":"","@translations":{"english":{"name":"Select Unit Access Level","description":""},"korean":{"name":"Select Unit Access Level","description":""},"spanish":{"name":"Select Unit Access Level","description":""}},"children":[],"@labels":["Select Unit Access Level"]},"PassAccClrFaults":{"@parent":"","@translations":{"english":{"name":"Fault Clear Access Level","description":""},"korean":{"name":"Fault Clear Access Level","description":""},"spanish":{"name":"Fault Clear Access Level","description":""}},"children":[],"@labels":["Fault Clear Access Level"]},"PassAccClrRej":{"@parent":"","@translations":{"english":{"name":"Reject Clear Access Level","description":""},"korean":{"name":"Reject Clear Access Level","description":""},"spanish":{"name":"Reject Clear Access Level","description":""}},"children":[],"@labels":["Reject Clear Access Level"]},"PassAccClrLatch":{"@parent":"","@translations":{"english":{"name":"Latch Clear Access Level","description":""},"korean":{"name":"Latch Clear Access Level","description":""},"spanish":{"name":"Latch Clear Access Level","description":""}},"children":[],"@labels":["Latch Clear Access Level"]},"PassAccTime":{"@parent":"","@translations":{"english":{"name":"Time Access Level","description":""},"korean":{"name":"Time Access Level","description":""},"spanish":{"name":"Time Access Level","description":""}},"children":[],"@labels":["Time Access Level"]},"PassAccSync":{"@parent":"","@translations":{"english":{"name":"Sync Access Level","description":""},"korean":{"name":"Sync Access Level","description":""},"spanish":{"name":"Sync Access Level","description":""}},"children":[],"@labels":["Sync Access Level"]},"INPUT_TACH":{"@parent":"","@translations":{"english":{"name":"Tachometer","description":""},"korean":{"name":"Tachometer","description":""},"spanish":{"name":"Tachometer","description":""}},"children":["INPUT_POL_TACH"],"@labels":["Source","Polarity"]},"INPUT_EYE":{"@parent":"","@translations":{"english":{"name":"Photo Eye","description":""},"korean":{"name":"Photo Eye","description":""},"spanish":{"name":"Photo Eye","description":""}},"children":["INPUT_POL_EYE"],"@labels":["Source","Polarity"]},"INPUT_RC_1":{"@parent":"","@translations":{"english":{"name":"Reject Check 1","description":""},"korean":{"name":"Reject Check 1","description":""},"spanish":{"name":"Reject Check 1","description":""}},"children":["INPUT_POL_RC_1"],"@labels":["Source","Polarity"]},"INPUT_RC_2":{"@parent":"","@translations":{"english":{"name":"Reject Check 2","description":""},"korean":{"name":"Reject Check 2","description":""},"spanish":{"name":"Reject Check 2","description":""}},"children":["INPUT_POL_RC_2"],"@labels":["Source","Polarity"]},"INPUT_REJ_EYE":{"@parent":"","@translations":{"english":{"name":"Reject Eye","description":""},"korean":{"name":"Reject Eye","description":""},"spanish":{"name":"Reject Eye","description":""}},"children":["INPUT_POL_REJ_EYE"],"@labels":["Source","Polarity"]},"INPUT_AIR_PRES":{"@parent":"","@translations":{"english":{"name":"Air Pressure","description":""},"korean":{"name":"Air Pressure","description":""},"spanish":{"name":"Air Pressure","description":""}},"children":["INPUT_POL_AIR_PRES"],"@labels":["Source","Polarity"]},"INPUT_REJ_LATCH":{"@parent":"","@translations":{"english":{"name":"Reject Latch","description":""},"korean":{"name":"Reject Latch","description":""},"spanish":{"name":"Reject Latch","description":""}},"children":["INPUT_POL_REJ_LATCH"],"@labels":["Source","Polarity"]},"INPUT_BIN_FULL":{"@parent":"","@translations":{"english":{"name":"Bin Full","description":""},"korean":{"name":"Bin Full","description":""},"spanish":{"name":"Bin Full","description":""}},"children":["INPUT_POL_BIN_FULL"],"@labels":["Source","Polarity"]},"INPUT_REJ_PRESENT":{"@parent":"","@translations":{"english":{"name":"Reject Present","description":""},"korean":{"name":"Reject Present","description":""},"spanish":{"name":"Reject Present","description":""}},"children":["INPUT_POL_REJ_PRESENT"],"@labels":["Source","Polarity"]},"INPUT_DOOR1_OPEN":{"@parent":"","@translations":{"english":{"name":"Door 1 Open","description":""},"korean":{"name":"Door 1 Open","description":""},"spanish":{"name":"Door 1 Open","description":""}},"children":["INPUT_POL_DOOR1_OPEN"],"@labels":["Source","Polarity"]},"INPUT_DOOR2_OPEN":{"@parent":"","@translations":{"english":{"name":"Door 2 Open","description":""},"korean":{"name":"Door 2 Open","description":""},"spanish":{"name":"Door 2 Open","description":""}},"children":["INPUT_POL_DOOR2_OPEN"],"@labels":["Source","Polarity"]},"INPUT_CLEAR_FAULTS":{"@parent":"","@translations":{"english":{"name":"Clear Faults","description":""},"korean":{"name":"Clear Faults","description":""},"spanish":{"name":"Clear Faults","description":""}},"children":["INPUT_POL_CLEAR_FAULTS"],"@labels":["Source","Polarity"]},"INPUT_CIP":{"@parent":"","@translations":{"english":{"name":"CIP","description":""},"korean":{"name":"CIP","description":""},"spanish":{"name":"CIP","description":""}},"children":["INPUT_POL_CIP"],"@labels":["Source","Polarity"]},"INPUT_PROD_SEL1":{"@parent":"","@translations":{"english":{"name":"Product Select 1","description":""},"korean":{"name":"Product Select 1","description":""},"spanish":{"name":"Product Select 1","description":""}},"children":["INPUT_POL_PROD_SEL1"],"@labels":["Source","Polarity"]},"INPUT_PROD_SEL2":{"@parent":"","@translations":{"english":{"name":"Product Select 2","description":""},"korean":{"name":"Product Select 2","description":""},"spanish":{"name":"Product Select 2","description":""}},"children":["INPUT_POL_PROD_SEL2"],"@labels":["Source","Polarity"]},"INPUT_PROD_SEL3":{"@parent":"","@translations":{"english":{"name":"Product Select 3","description":""},"korean":{"name":"Product Select 3","description":""},"spanish":{"name":"Product Select 3","description":""}},"children":["INPUT_POL_PROD_SEL3"],"@labels":["Source","Polarity"]},"INPUT_PROD_SEL4":{"@parent":"","@translations":{"english":{"name":"Product Select 4","description":""},"korean":{"name":"Product Select 4","description":""},"spanish":{"name":"Product Select 4","description":""}},"children":["INPUT_POL_PROD_SEL4"],"@labels":["Source","Polarity"]},"INPUT_TEST":{"@parent":"","@translations":{"english":{"name":"Test","description":""},"korean":{"name":"Test","description":""},"spanish":{"name":"Test","description":""}},"children":["INPUT_POL_TEST"],"@labels":["Source","Polarity"]},"OUT_PHY_PL3_1":{"@parent":"","@translations":{"english":{"name":"PL3 1","description":""},"korean":{"name":"PL3 1","description":""},"spanish":{"name":"PL3 1","description":""}},"children":["OUT_POL_PL3_1"],"@labels":["Source","Polarity"]},"OUT_PHY_PL11_1A2":{"@parent":"","@translations":{"english":{"name":"PL11 1A2","description":""},"korean":{"name":"PL11 1A2","description":""},"spanish":{"name":"PL11 1A2","description":""}},"children":["OUT_POL_PL11_1A2"],"@labels":["Source","Polarity"]},"OUT_PHY_PL11_3A4":{"@parent":"","@translations":{"english":{"name":"PL11 3A4","description":""},"korean":{"name":"PL11 3A4","description":""},"spanish":{"name":"PL11 3A4","description":""}},"children":["OUT_POL_PL11_3A4"],"@labels":["Source","Polarity"]},"OUT_PHY_PL11_5A6":{"@parent":"","@translations":{"english":{"name":"PL11 5A6","description":""},"korean":{"name":"PL11 5A6","description":""},"spanish":{"name":"PL11 5A6","description":""}},"children":["OUT_POL_PL11_5A6"],"@labels":["Source","Polarity"]},"OUT_PHY_PL4_1":{"@parent":"","@translations":{"english":{"name":"PL4 1","description":""},"korean":{"name":"PL4 1","description":""},"spanish":{"name":"PL4 1","description":""}},"children":["OUT_POL_PL4_1"],"@labels":["Source","Polarity"]},"OUT_PHY_PL4_2":{"@parent":"","@translations":{"english":{"name":"PL4 2","description":""},"korean":{"name":"PL4 2","description":""},"spanish":{"name":"PL4 2","description":""}},"children":["OUT_POL_PL4_2"],"@labels":["Source","Polarity"]},"OUT_PHY_PL4_3":{"@parent":"","@translations":{"english":{"name":"PL4 3","description":""},"korean":{"name":"PL4 3","description":""},"spanish":{"name":"PL4 3","description":""}},"children":["OUT_POL_PL4_3"],"@labels":["Source","Polarity"]},"OUT_PHY_PL4_5":{"@parent":"","@translations":{"english":{"name":"PL4 5","description":""},"korean":{"name":"PL4 5","description":""},"spanish":{"name":"PL4 5","description":""}},"children":["OUT_POL_PL4_5"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_R1":{"@parent":"","@translations":{"english":{"name":"IO PL3 R1","description":""},"korean":{"name":"IO PL3 R1","description":""},"spanish":{"name":"IO PL3 R1","description":""}},"children":["OUT_POL_IO_PL3_R1"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_R2":{"@parent":"","@translations":{"english":{"name":"IO PL3 R2","description":""},"korean":{"name":"IO PL3 R2","description":""},"spanish":{"name":"IO PL3 R2","description":""}},"children":["OUT_POL_IO_PL3_R2"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_O1":{"@parent":"","@translations":{"english":{"name":"IO PL3 O1","description":""},"korean":{"name":"IO PL3 O1","description":""},"spanish":{"name":"IO PL3 O1","description":""}},"children":["OUT_POL_IO_PL3_O1"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_O2":{"@parent":"","@translations":{"english":{"name":"IO PL3 O2","description":""},"korean":{"name":"IO PL3 O2","description":""},"spanish":{"name":"IO PL3 O2","description":""}},"children":["OUT_PHY_IO_PL3_O2"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL3_O3":{"@parent":"","@translations":{"english":{"name":"IO PL3 O3","description":""},"korean":{"name":"IO PL3 O3","description":""},"spanish":{"name":"IO PL3 O3","description":""}},"children":["OUT_POL_IO_PL3_O3"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL4_02":{"@parent":"","@translations":{"english":{"name":"IO PL4 02","description":""},"korean":{"name":"IO PL4 02","description":""},"spanish":{"name":"IO PL4 02","description":""}},"children":["OUT_POL_IO_PL4_02"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL4_03":{"@parent":"","@translations":{"english":{"name":"IO PL4 03","description":""},"korean":{"name":"IO PL4 03","description":""},"spanish":{"name":"IO PL4 03","description":""}},"children":["OUT_POL_IO_PL4_03"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL4_04":{"@parent":"","@translations":{"english":{"name":"IO PL4 04","description":""},"korean":{"name":"IO PL4 04","description":""},"spanish":{"name":"IO PL4 04","description":""}},"children":["OUT_POL_IO_PL4_04"],"@labels":["Source","Polarity"]},"OUT_PHY_IO_PL4_05":{"@parent":"","@translations":{"english":{"name":"IO PL4 05","description":""},"korean":{"name":"IO PL4 05","description":""},"spanish":{"name":"IO PL4 05","description":""}},"children":["OUT_POL_IO_PL4_05"],"@labels":["Source","Polarity"]},"SRecordDate":{"@parent":"","@translations":{"english":{"name":"System Record Date","description":""},"korean":{"name":"System Record Date","description":""},"spanish":{"name":"System Record Date","description":""}},"children":[],"@labels":["System Record Date"]},"ProdNo":{"@parent":"","@translations":{"english":{"name":"Product Number","description":""},"korean":{"name":"Product Number","description":""},"spanish":{"name":"Product Number","description":""}},"children":[],"@labels":["Product Number"]},"Unit":{"@parent":"","@translations":{"english":{"name":"Unit","description":""},"korean":{"name":"Unit","description":""},"spanish":{"name":"Unit","description":""}},"children":[],"@labels":["Unit"]},"RefFaultMask":{"@parent":"","@translations":{"english":{"name":"Reference Fault","description":""},"korean":{"name":"Reference Fault","description":""},"spanish":{"name":"Reference Fault","description":""}},"children":[],"@labels":["Reference Fault"]},"BalFaultMask":{"@parent":"","@translations":{"english":{"name":"Balance Fault","description":""},"korean":{"name":"Balance Fault","description":""},"spanish":{"name":"Balance Fault","description":""}},"children":[],"@labels":["Balance Fault"]},"ProdMemFaultMask":{"@parent":"","@translations":{"english":{"name":"Product Memory Fault","description":""},"korean":{"name":"Product Memory Fault","description":""},"spanish":{"name":"Product Memory Fault","description":""}},"children":[],"@labels":["Product Memory Fault"]},"RejConfirmFaultMask":{"@parent":"","@translations":{"english":{"name":"Reject Confirm Fault","description":""},"korean":{"name":"Reject Confirm Fault","description":""},"spanish":{"name":"Reject Confirm Fault","description":""}},"children":[],"@labels":["Reject Confirm Fault"]},"PhaseFaultMask":{"@parent":"","@translations":{"english":{"name":"Phase Fault","description":""},"korean":{"name":"Phase Fault","description":""},"spanish":{"name":"Phase Fault","description":""}},"children":[],"@labels":["Phase Fault"]},"TestSigFaultMask":{"@parent":"","@translations":{"english":{"name":"Test Signal Fault","description":""},"korean":{"name":"Test Signal Fault","description":""},"spanish":{"name":"Test Signal Fault","description":""}},"children":[],"@labels":["Test Signal Fault"]},"PeyeBlockFaultMask":{"@parent":"","@translations":{"english":{"name":"Photoeye Block Fault","description":""},"korean":{"name":"Photoeye Block Fault","description":""},"spanish":{"name":"Photoeye Block Fault","description":""}},"children":[],"@labels":["Photoeye Block Fault"]},"RejBinFullFaultMask":{"@parent":"","@translations":{"english":{"name":"Reject Bin Full Fault","description":""},"korean":{"name":"Reject Bin Full Fault","description":""},"spanish":{"name":"Reject Bin Full Fault","description":""}},"children":[],"@labels":["Reject Bin Full Fault"]},"AirFaultMask":{"@parent":"","@translations":{"english":{"name":"Air Fault","description":""},"korean":{"name":"Air Fault","description":""},"spanish":{"name":"Air Fault","description":""}},"children":[],"@labels":["Air Fault"]},"ExcessRejFaultMask":{"@parent":"","@translations":{"english":{"name":"Excess Rejects Fault","description":""},"korean":{"name":"Excess Rejects Fault","description":""},"spanish":{"name":"Excess Rejects Fault","description":""}},"children":[],"@labels":["Excess Rejects Fault"]},"BigMetalFaultMask":{"@parent":"","@translations":{"english":{"name":"Large Metal Fault","description":""},"korean":{"name":"Large Metal Fault","description":""},"spanish":{"name":"Large Metal Fault","description":""}},"children":[],"@labels":["Large Metal Fault"]},"NetBufferFaultMask":{"@parent":"","@translations":{"english":{"name":"Net Buffer Fault","description":""},"korean":{"name":"Net Buffer Fault","description":""},"spanish":{"name":"Net Buffer Fault","description":""}},"children":[],"@labels":["Net Buffer Fault"]},"RejMemoryFaultMask":{"@parent":"","@translations":{"english":{"name":"Reject Memory Fault","description":""},"korean":{"name":"Reject Memory Fault","description":""},"spanish":{"name":"Reject Memory Fault","description":""}},"children":[],"@labels":["Reject Memory Fault"]},"RejectExitFaultMask":{"@parent":"","@translations":{"english":{"name":"Reject Exit Fault","description":""},"korean":{"name":"Reject Exit Fault","description":""},"spanish":{"name":"Reject Exit Fault","description":""}},"children":[],"@labels":["Reject Exit Fault"]},"TachometerFaultMask":{"@parent":"","@translations":{"english":{"name":"Tachometer Fault","description":""},"korean":{"name":"Tachometer Fault","description":""},"spanish":{"name":"Tachometer Fault","description":""}},"children":[],"@labels":["Tachometer Fault"]},"PatternFaultMask":{"@parent":"","@translations":{"english":{"name":"Pattern Fault","description":""},"korean":{"name":"Pattern Fault","description":""},"spanish":{"name":"Pattern Fault","description":""}},"children":[],"@labels":["Pattern Fault"]},"ExitNoPackFaultMask":{"@parent":"","@translations":{"english":{"name":"Exit No Pack Fault","description":""},"korean":{"name":"Exit No Pack Fault","description":""},"spanish":{"name":"Exit No Pack Fault","description":""}},"children":[],"@labels":["Exit No Pack Fault"]},"ExitNewPackFaultMask":{"@parent":"","@translations":{"english":{"name":"Exit New Pack Fault","description":""},"korean":{"name":"Exit New Pack Fault","description":""},"spanish":{"name":"Exit New Pack Fault","description":""}},"children":[],"@labels":["Exit New Pack Fault"]},"InterceptorFaultMask":{"@parent":"","@translations":{"english":{"name":"Interceptor Fault","description":""},"korean":{"name":"Interceptor Fault","description":""},"spanish":{"name":"Interceptor Fault","description":""}},"children":[],"@labels":["Interceptor Fault"]},"RtcLowBatFaultMask":{"@parent":"","@translations":{"english":{"name":"Rtc Low Batter Fault","description":""},"korean":{"name":"Rtc Low Batter Fault","description":""},"spanish":{"name":"Rtc Low Batter Fault","description":""}},"children":[],"@labels":["Rtc Low Batter Fault"]},"RtcTimeFaultMask":{"@parent":"","@translations":{"english":{"name":"Rtc Time Fault","description":""},"korean":{"name":"Rtc Time Fault","description":""},"spanish":{"name":"Rtc Time Fault","description":""}},"children":[],"@labels":["Rtc Time Fault"]},"IntUsbFaultMask":{"@parent":"","@translations":{"english":{"name":"Int Usb Fault","description":""},"korean":{"name":"Int Usb Fault","description":""},"spanish":{"name":"Int Usb Fault","description":""}},"children":[],"@labels":["Int Usb Fault"]},"IoBoardFaultMask":{"@parent":"","@translations":{"english":{"name":"IO Board Fault","description":""},"korean":{"name":"IO Board Fault","description":""},"spanish":{"name":"IO Board Fault","description":""}},"children":[],"@labels":["IO Board Fault"]},"HaloFaultMask":{"@parent":"","@translations":{"english":{"name":"Halo Fault","description":""},"korean":{"name":"Halo Fault","description":""},"spanish":{"name":"Halo Fault","description":""}},"children":[],"@labels":["Halo Fault"]},"SignalFaultMask":{"@parent":"","@translations":{"english":{"name":"Signal Fault","description":""},"korean":{"name":"Signal Fault","description":""},"spanish":{"name":"Signal Fault","description":""}},"children":[],"@labels":["Signal Fault"]}},"@netpollsmap":{"NET_POLL_PROTOCOL_VERSION":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_KEY_CLASS_MASK":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_PROD_REC_VAR":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_PROD_SYS_VAR":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_REJECT":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_REJECT2":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_REJ_CNT":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_FAULT":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_CONTROL":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_POWERUP":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_OPERATOR_NO":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_TEST_REQ_PASS":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_REJECT_ID":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_REJECT_CLEAR":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_EYE_PROD_PEAK":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_EYE_PROD_PHASE":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_FAULT_CLEAR":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_SYNC_MENU":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_PWD_ENTRY_1":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_PWD_ENTRY_2":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_SEL_UNIT":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_RESERVED":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_CLEAR_SCOPE":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_REJECT_PHASE":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_FLASH_WRITE":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_INTCPTR_SWITCH":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_PREC_DELETE":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_PREC_DEL_ALL":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_PREC_BACKUP_SAVE":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_PREC_BACKUP_RESTORE":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_PREC_DEAULTS":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_PREC_COPY":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_REJECT2_ID":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}},"NET_POLL_REJECT2_CLEAR":{"@translations":{"english":{"name":""},"korean":{"name":""},"spanish":{"name":""}}}},"@pages":{"Sens":{"cat":"Sens","params":["Sens_A","DetThresh_A","ThresProdHi_A","ThresX_A","ThresR_A","BigMetThres_A","DetMode_A","NoiseR_A","NoiseX_A","DetThEst_A"],"subCats":[{"cat":"Filter","params":["NoiseR_A","NoiseX_A","FilterNoise_A"],"subCats":[]},{"cat":"Oscillation Power","params":["OscPower_A"],"subCats":[]},{"cat":"FM Setup","params":["FmInput_A"],"subCats":[]}]},"Test":{"cat":"Test","params":["TestTime","TestDeferTime","TestMode"],"subCats":[{"cat":"Manual","params":["TestConfigCount0_0","TestConfigCount0_1","TestConfigCount0_2","TestConfigCount0_3","TestConfigCount0_4","TestConfigCount0_5","TestConfigAck0","TestConfigOperator0","TestConfigHaloMode0"],"subCats":[]},{"cat":"Halo","params":["TestConfigCount1_0","TestConfigCount1_1","TestConfigCount1_2","TestConfigCount1_3","TestConfigCount1_4","TestConfigCount1_5","TestConfigAck1","TestConfigOperator1","TestConfigHaloMode1"],"subCats":[]},{"cat":"Manual2","params":["TestConfigCount2_0","TestConfigCount2_1","TestConfigCount2_2","TestConfigCount2_3","TestConfigCount2_4","TestConfigCount2_5","TestConfigAck2","TestConfigOperator2","TestConfigHaloMode2"],"subCats":[]},{"cat":"Halo2","params":["TestConfigCount3_0","TestConfigCount3_1","TestConfigCount3_2","TestConfigCount3_3","TestConfigCount3_4","TestConfigCount3_5","TestConfigAck3","TestConfigOperator3","TestConfigHaloMode3"],"subCats":[]},{"cat":"HaloConf","params":["HaloPeakRFe_A","HaloPeakXFe_A","HaloPeakRNFe_A","HaloPeakXNFe_A","HaloPeakRSs_A","HaloPeakXSs_A"],"subCats":[]}]},"Calibration":{"cat":"Calibration","params":[],"subCats":[{"cat":"Phase","params":["PhaseAngle_A","PhaseAngleAuto_A","PhaseMode_A","PhaseSpeed_A","PhaseFastBit_A","PhaseWetBit_A","PhaseDSALearn_A"],"subCats":[]},{"cat":"MPhase","params":["MPhaseOrder_A","MPhaseDD_A","MPhaseRD_A"],"subCats":[]}]}},"@catmap":{"Reject":{"@translations":{"english":"Reject","korean":"거부","spanish":"Reject"}},"Password":{"@translations":{"english":"Password","korean":"암호","spanish":"Password"}},"IO":{"@translations":{"english":"I/O","korean":"입출력","spanish":"I/O"}},"System":{"@translations":{"english":"System","korean":"시스템","spanish":"System"}},"Fault":{"@translations":{"english":"Faults","korean":"오류","spanish":"Faults"}},"Reject/Additional Settings":{"@translations":{"english":"Additional Settings","korean":"추가 설정","spanish":"Additional Settings"}},"Reject/Additional Settings/Distances":{"@translations":{"english":"Distances","korean":"거리","spanish":"Distances"}},"Reject/Additional Settings/Belt Speed":{"@translations":{"english":"Belt Speed","korean":"벨트 속도","spanish":"Belt Speed"}},"Reject/Additional Settings/Latch":{"@translations":{"english":"Latches","korean":"Latches","spanish":"Latches"}},"Reject/Additional Settings/Clocks":{"@translations":{"english":"Clocks","korean":"Clocks","spanish":"Clocks"}},"IO/Inputs":{"@translations":{"english":"Inputs","korean":"입력","spanish":"Inputs"}},"IO/Outputs":{"@translations":{"english":"Outputs","korean":"출력","spanish":"Outputs"}},"Sens":{"@translations":{"english":"Sensitivity","korean":"민감도","spanish":"Sensitivity"}},"Test":{"@translations":{"english":"Test","korean":"테스트","spanish":"Test"}},"Test/Manual":{"@translations":{"english":"Manual Test 1","korean":"Manual Test 1","spanish":"Manual Test 1"}},"Test/Halo":{"@translations":{"english":"Halo Test 1","korean":"Halo Test 1","spanish":"Halo Test 1"}},"Test/Manual2":{"@translations":{"english":"Manual Test 2","korean":"Manual Test 2","spanish":"Manual Test 2"}},"Test/Halo2":{"@translations":{"english":"Halo Test 2","korean":"Halo Test 2","spanish":"Halo Test 2"}},"Test/HaloConf":{"@translations":{"english":"Test Configuration","korean":"Test Configuration","spanish":"Test Configuration"}},"Sens/Filter":{"@translations":{"english":"Filter Noise","korean":"Filter Noise","spanish":"Filter Noise"}},"Sens/Oscillation Power":{"@translations":{"english":"Oscillation Power","korean":"Oscillation Power","spanish":"Oscillation Power"}},"Sens/FM Setup":{"@translations":{"english":"FM Setup","korean":"FM Setup","spanish":"FM Setup"}},"Calibration":{"@translations":{"english":"Calibration","korean":"Calibration","spanish":"Calibration"}},"Calibration/Phase":{"@translations":{"english":"Phase","korean":"Phase","spanish":"Phase"}},"Calibration/MPhase":{"@translations":{"english":"M Phase","korean":"M Phase","spanish":"M Phase"}}},"@languages":["english","korean","spanish"],"@labels":{"Channel A":{"english":{"name":"Channel A"},"korean":{"name":"Channel A"},"spanish":{"name":""}},"Channel B":{"english":{"name":"Channel B"},"korean":{"name":"Channel B"},"spanish":{"name":""}},"Count":{"english":{"name":"Count"},"korean":{"name":"Count"},"spanish":{"name":""}},"Metal Type":{"english":{"name":"Metal Type"},"korean":{"name":"Metal Type"},"spanish":{"name":""}},"Signal Chain":{"english":{"name":"Signal Chain"},"korean":{"name":"Signal Chain"},"spanish":{"name":""}},"Source":{"english":{"name":"Source"},"korean":{"name":"Source"},"spanish":{"name":""}},"Polarity":{"english":{"name":"Polarity"},"korean":{"name":"Polarity"},"spanish":{"name":""}},"Sensitivity":{"english":{"name":"Sensitivity"},"korean":{"name":"민감도"},"spanish":{"name":"Sensibildad"}},"Signal":{"english":{"name":"Signal"},"korean":{"name":"신호"},"spanish":{"name":"Señal"}},"Rejects":{"english":{"name":"Rejects"},"korean":{"name":"거부"},"spanish":{"name":"rechaza"}},"Settings":{"english":{"name":"Settings"},"korean":{"name":"설정"},"spanish":{"name":"ajustes"}},"Test":{"english":{"name":"Test"},"korean":{"name":"테스트"},"spanish":{"name":"Test"}},"Log":{"english":{"name":"Log"},"korean":{"name":"기록"},"spanish":{"name":"Log"}},"Calibrate":{"english":{"name":"Calibrate"},"korean":{"name":"조정"},"spanish":{"name":"Calibrate"}},"Product":{"english":{"name":"Product"},"korean":{"name":"품목"},"spanish":{"name":"Prodct"}},"Running Product":{"english":{"name":"Running Product"},"korean":{"name":"현 품목"},"spanish":{"name":"Running Product"}},"Select Test":{"english":{"name":"Select Test"},"korean":{"name":"테스트 선택"},"spanish":{"name":"Select Test"}},"Currently Running":{"english":{"name":"Currently Running"},"korean":{"name":"실행중"},"spanish":{"name":"Currently Running"}},"Quit Test":{"english":{"name":"Quit Test"},"korean":{"name":"테스트 중단"},"spanish":{"name":"Quit Test"}},"activate":{"english":{"name":"activate"},"korean":{"name":"activate"},"spanish":{"name":"activate"}},"Clear Faults":{"english":{"name":"Clear Faults"},"korean":{"name":"Clear Faults"},"spanish":{"name":"Clear Faults"}},"No Faults":{"english":{"name":"No Faults"},"korean":{"name":"No Faults"},"spanish":{"name":"No Faults"}},"Calibrate All":{"english":{"name":"Calibrate All"},"korean":{"name":"전부 조정"},"spanish":{"name":"Calibrate All"}}}
}*/
var vdefMapST = {
  "@categories":{"cat":"@root","params":["Language"],"subCats":[{"cat":"Reject","params":["RejDelSec","RejDelSec2","RejDurSec","RejDurSec2","RejMode"],"subCats":[{"cat":"Additional Settings","params":[],"subCats":[{"cat":"Distances","params":["RejExitDist","RejExitWin","AppUnitDist"],"subCats":[]},{"cat":"Belt Speed","params":["BeltSpeed"],"subCats":[]},{"cat":"Latch","params":["FaultLatch","RejLatchMode","Rej2Latch"],"subCats":[]},{"cat":"Clocks","params":["RejBinDoorTime","CIPCycleTime","CIPDwellTime","FaultClearTime","EyeBlockTime","RejCheckTime","ExcessRejTime","RejDelClock"],"subCats":[]}]}]},{"cat":"Password","params":["PW1","PW2","PW3","PW4","PassAccSens","PassAccProd","PassAccCal","PassAccTest","PassAccSelUnit","PassAccClrFaults","PassAccClrRej","PassAccClrLatch","PassAccTime","PassAccSync"],"subCats":[]},{"cat":"IO","params":[],"subCats":[{"cat":"Inputs","params":["INPUT_TACH","INPUT_EYE","INPUT_RC_1","INPUT_RC_2","INPUT_REJ_EYE","INPUT_AIR_PRES","INPUT_REJ_LATCH","INPUT_BIN_FULL","INPUT_REJ_PRESENT","INPUT_DOOR1_OPEN","INPUT_DOOR2_OPEN","INPUT_CLEAR_FAULTS","INPUT_CIP","INPUT_PROD_SEL1","INPUT_PROD_SEL2","INPUT_PROD_SEL3","INPUT_PROD_SEL4","INPUT_TEST"],"subCats":[]},{"cat":"Outputs","params":["OUT_PHY_PL3_1","OUT_PHY_PL11_1A2","OUT_PHY_PL11_3A4","OUT_PHY_PL11_5A6","OUT_PHY_PL4_1","OUT_PHY_PL4_2","OUT_PHY_PL4_3","OUT_PHY_PL4_5","OUT_PHY_IO_PL3_R1","OUT_PHY_IO_PL3_R2","OUT_PHY_IO_PL3_O1","OUT_PHY_IO_PL3_O2","OUT_PHY_IO_PL3_O3","OUT_PHY_IO_PL4_02","OUT_PHY_IO_PL4_03","OUT_PHY_IO_PL4_04","OUT_PHY_IO_PL4_05"],"subCats":[]}]},{"cat":"System","params":["SRecordDate","ProdNo","Unit"],"subCats":[]},{"cat":"Fault","params":["RefFaultMask","BalFaultMask","ProdMemFaultMask","RejConfirmFaultMask","PhaseFaultMask","TestSigFaultMask","PeyeBlockFaultMask","RejBinFullFaultMask","AirFaultMask","ExcessRejFaultMask","BigMetalFaultMask","NetBufferFaultMask","RejMemoryFaultMask","RejectExitFaultMask","TachometerFaultMask","PatternFaultMask","ExitNoPackFaultMask","ExitNewPackFaultMask","InterceptorFaultMask","RtcLowBatFaultMask","RtcTimeFaultMask","IntUsbFaultMask","IoBoardFaultMask","HaloFaultMask","SignalFaultMask"],"subCats":[]}]},"@vMap":{"Sens":{"@parent":"","@translations":{"english":{"name":"Sensitivity","description":""}},"children":[]},"DetThresh":{"@parent":"","@translations":{"english":{"name":"Detection Threshold","description":""}},"children":[]},"ThresProdHi":{"@parent":"","@translations":{"english":{"name":"Product High Threshold","description":""}},"children":[]},"ThresX":{"@parent":"","@translations":{"english":{"name":"X Threshold","description":""}},"children":[]},"ThresR":{"@parent":"","@translations":{"english":{"name":"R Threshold","description":""}},"children":[]},"BigMetThres":{"@parent":"","@translations":{"english":{"name":"Large Metal Threshold","description":""}},"children":[]},"DetMode":{"@parent":"","@translations":{"english":{"name":"Detection Mode","description":""}},"children":[]},"NoiseR":{"@parent":"","@translations":{"english":{"name":"R Channel Noise","description":""}},"children":[]},"DetThEst":{"@parent":"","@translations":{"english":{"name":"Detection Threshold Est","description":""}},"children":[]},"NoiseX":{"@parent":"","@translations":{"english":{"name":"X Channel Noise","description":""}},"children":[]},"TestTime":{"@parent":"","@translations":{"english":{"name":"Test Time","description":""}},"children":[]},"TestDeferTime":{"@parent":"","@translations":{"english":{"name":"Test Defer TIme","description":""}},"children":[]},"TestMode":{"@parent":"","@translations":{"english":{"name":"Test Mode","description":""}},"children":[]},"TestConfigCount0_0":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""}},"children":["TestConfigMetal0_0"]},"TestConfigCount0_1":{"@parent":"","@translations":{"english":{"name":"Test 2","description":""}},"children":["TestConfigMetal0_1"]},"TestConfigCount0_2":{"@parent":"","@translations":{"english":{"name":"Test 3","description":""}},"children":["TestConfigMetal0_2"]},"TestConfigAck0":{"@parent":"","@translations":{"english":{"name":"Acknowledge","description":""}},"children":[]},"TestConfigOperator0":{"@parent":"","@translations":{"english":{"name":"Operator","description":""}},"children":[]},"TestConfigHaloMode0":{"@parent":"","@translations":{"english":{"name":"Halo Mode","description":""}},"children":[]},"TestConfigCount1_0":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""}},"children":["TestConfigMetal1_0"]},"TestConfigCount1_1":{"@parent":"","@translations":{"english":{"name":"Test 2","description":""}},"children":["TestConfigMetal1_1"]},"TestConfigCount1_2":{"@parent":"","@translations":{"english":{"name":"Test 3","description":""}},"children":["TestConfigMetal1_2"]},"TestConfigAck1":{"@parent":"","@translations":{"english":{"name":"Acknowledge","description":""}},"children":[]},"TestConfigOperator1":{"@parent":"","@translations":{"english":{"name":"Operator","description":""}},"children":[]},"TestConfigHaloMode1":{"@parent":"","@translations":{"english":{"name":"Halo Mode","description":""}},"children":[]},"TestConfigCount2_0":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_0"]},"TestConfigCount2_1":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_1"]},"TestConfigCount2_2":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""}},"children":["TestConfigMetal2_2"]},"TestConfigAck2":{"@parent":"","@translations":{"english":{"name":"Acknowledge","description":""}},"children":[]},"TestConfigOperator2":{"@parent":"","@translations":{"english":{"name":"Operator","description":""}},"children":[]},"TestConfigHaloMode2":{"@parent":"","@translations":{"english":{"name":"Halo Mode","description":""}},"children":[]},"TestConfigCount3_0":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_0"]},"TestConfigCount3_1":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_1"]},"TestConfigCount3_2":{"@parent":"","@translations":{"english":{"name":"Test 1","description":""}},"children":["TestConfigMetal3_2"]},"TestConfigAck3":{"@parent":"","@translations":{"english":{"name":"Acknowledge","description":""}},"children":[]},"TestConfigOperator3":{"@parent":"","@translations":{"english":{"name":"Operator","description":""}},"children":[]},"TestConfigHaloMode3":{"@parent":"","@translations":{"english":{"name":"Halo Mode","description":""}},"children":[]},"HaloPeakRFe":{"@parent":"","@translations":{"english":{"name":"Ferrous R Peak","description":""}},"children":[]},"HaloPeakXFe":{"@parent":"","@translations":{"english":{"name":"Ferrous X Peak","description":""}},"children":[]},"HaloPeakRNFe":{"@parent":"","@translations":{"english":{"name":"Non-Ferrous R Peak","description":""}},"children":[]},"HaloPeakXNFe":{"@parent":"","@translations":{"english":{"name":"Non-Ferrous X Peak","description":""}},"children":[]},"HaloPeakRSs":{"@parent":"","@translations":{"english":{"name":"Stainless R Peak","description":""}},"children":[]},"HaloPeakXSs":{"@parent":"","@translations":{"english":{"name":"Stainless X Peak","description":""}},"children":[]},"PhaseAngle":{"@parent":"","@translations":{"english":{"name":"Phase Angle","description":""}},"children":[]},"PhaseMode":{"@parent":"","@translations":{"english":{"name":"Phase Mode","description":""}},"children":[]},"PhaseSpeed":{"@parent":"","@translations":{"english":{"name":"Phase Speed","description":""}},"children":[]},"PhaseModeHold":{"@parent":"","@translations":{"english":{"name":"","description":""}},"children":[]},"PhaseLimitDry":{"@parent":"","@translations":{"english":{"name":"","description":""}},"children":[]},"PhaseLimitDrySpread":{"@parent":"","@translations":{"english":{"name":"","description":""}},"children":[]},"PhaseLimitWet":{"@parent":"","@translations":{"english":{"name":"","description":""}},"children":[]},"PhaseLimitWetSpread":{"@parent":"","@translations":{"english":{"name":"","description":""}},"children":[]},"PhaseAngleAuto":{"@parent":"","@translations":{"english":{"name":"Auto Phase Angle","description":""}},"children":[]},"PhaseFastBit":{"@parent":"","@translations":{"english":{"name":"","description":""}},"children":[]},"PhaseWetBit":{"@parent":"","@translations":{"english":{"name":"","description":""}},"children":[]},"PhaseDSALearn":{"@parent":"","@translations":{"english":{"name":"","description":""}},"children":[]},"MPhaseOrder":{"@parent":"","@translations":{"english":{"name":"M Phase Order","description":""}},"children":[]},"MPhaseDD":{"@parent":"","@translations":{"english":{"name":"M Phase DD","description":""}},"children":[]},"MPhaseRD":{"@parent":"","@translations":{"english":{"name":"M Phase RD","description":""}},"children":[]},"Language":{"@parent":"","@translations":{"english":{"name":"Language","description":"This is a description of f the language"}},"children":[]},"RejDelSec":{"@parent":"","@translations":{"english":{"name":"Main Reject Delay","description":""}},"children":[]},"RejDelSec2":{"@parent":"","@translations":{"english":{"name":"Alternate Reject Delay","description":""}},"children":[]},"RejDurSec":{"@parent":"","@translations":{"english":{"name":"Main Reject Duration","description":""}},"children":[]},"RejDurSec2":{"@parent":"","@translations":{"english":{"name":"Alternate Reject Duration","description":""}},"children":[]},"RejMode":{"@parent":"","@translations":{"english":{"name":"Reject Mode","description":""}},"children":[]},"RejExitDist":{"@parent":"","@translations":{"english":{"name":"Reject Exit Distance","description":""}},"children":[]},"RejExitWin":{"@parent":"","@translations":{"english":{"name":"Reject Exit Window","description":""}},"children":[]},"AppUnitDist":{"@parent":"","@translations":{"english":{"name":"Units ","description":""}},"children":[]},"BeltSpeed":{"@parent":"","@translations":{"english":{"name":"Belt Speed","description":""}},"children":[]},"FaultLatch":{"@parent":"","@translations":{"english":{"name":"Fault Latch","description":""}},"children":[]},"RejLatchMode":{"@parent":"","@translations":{"english":{"name":"Reject Latch","description":""}},"children":[]},"Rej2Latch":{"@parent":"","@translations":{"english":{"name":"Alternate Reject Latch","description":""}},"children":[]},"RejBinDoorTime":{"@parent":"","@translations":{"english":{"name":"Reject Bin Door Time","description":""}},"children":[]},"CIPCycleTime":{"@parent":"","@translations":{"english":{"name":"CIP Cycle Time","description":""}},"children":[]},"CIPDwellTime":{"@parent":"","@translations":{"english":{"name":"CIP Dwell Time","description":""}},"children":[]},"FaultClearTime":{"@parent":"","@translations":{"english":{"name":"Fault Clear Time","description":""}},"children":[]},"EyeBlockTime":{"@parent":"","@translations":{"english":{"name":"Eye Block Time","description":""}},"children":[]},"RejCheckTime":{"@parent":"","@translations":{"english":{"name":"Reject Check Time","description":""}},"children":[]},"ExcessRejTime":{"@parent":"","@translations":{"english":{"name":"Excess Reject Time","description":""}},"children":[]},"RejDelClock":{"@parent":"","@translations":{"english":{"name":"Reject Delay Clock","description":""}},"children":[]},"PW1":{"@parent":"","@translations":{"english":{"name":"Password 1","description":""}},"children":[]},"PW2":{"@parent":"","@translations":{"english":{"name":"Password 2","description":""}},"children":[]},"PW3":{"@parent":"","@translations":{"english":{"name":"Password 3","description":""}},"children":[]},"PW4":{"@parent":"","@translations":{"english":{"name":"Password 4","description":""}},"children":[]},"PassAccSens":{"@parent":"","@translations":{"english":{"name":"Sensitivity Access Level","description":""}},"children":[]},"PassAccProd":{"@parent":"","@translations":{"english":{"name":"Product Access Level","description":""}},"children":[]},"PassAccCal":{"@parent":"","@translations":{"english":{"name":"Calibrate Access Level","description":""}},"children":[]},"PassAccTest":{"@parent":"","@translations":{"english":{"name":"Test Access Level","description":""}},"children":[]},"PassAccSelUnit":{"@parent":"","@translations":{"english":{"name":"Select Unit Access Level","description":""}},"children":[]},"PassAccClrFaults":{"@parent":"","@translations":{"english":{"name":"Fault Clear Access Level","description":""}},"children":[]},"PassAccClrRej":{"@parent":"","@translations":{"english":{"name":"Reject Clear Access Level","description":""}},"children":[]},"PassAccClrLatch":{"@parent":"","@translations":{"english":{"name":"Latch Clear Access Level","description":""}},"children":[]},"PassAccTime":{"@parent":"","@translations":{"english":{"name":"Time Access Level","description":""}},"children":[]},"PassAccSync":{"@parent":"","@translations":{"english":{"name":"Sync Access Level","description":""}},"children":[]},"INPUT_TACH":{"@parent":"","@translations":{"english":{"name":"Tachometer","description":""}},"children":["INPUT_POL_TACH"]},"INPUT_EYE":{"@parent":"","@translations":{"english":{"name":"Photo Eye","description":""}},"children":["INPUT_POL_EYE"]},"INPUT_RC_1":{"@parent":"","@translations":{"english":{"name":"Reject Check 1","description":""}},"children":["INPUT_POL_RC_1"]},"INPUT_RC_2":{"@parent":"","@translations":{"english":{"name":"Reject Check 2","description":""}},"children":["INPUT_POL_RC_2"]},"INPUT_REJ_EYE":{"@parent":"","@translations":{"english":{"name":"Reject Eye","description":""}},"children":["INPUT_POL_REJ_EYE"]},"INPUT_AIR_PRES":{"@parent":"","@translations":{"english":{"name":"Air Pressure","description":""}},"children":["INPUT_POL_AIR_PRES"]},"INPUT_REJ_LATCH":{"@parent":"","@translations":{"english":{"name":"Reject Latch","description":""}},"children":["INPUT_POL_REJ_LATCH"]},"INPUT_BIN_FULL":{"@parent":"","@translations":{"english":{"name":"Bin Full","description":""}},"children":["INPUT_POL_BIN_FULL"]},"INPUT_REJ_PRESENT":{"@parent":"","@translations":{"english":{"name":"Reject Present","description":""}},"children":["INPUT_POL_REJ_PRESENT"]},"INPUT_DOOR1_OPEN":{"@parent":"","@translations":{"english":{"name":"Door 1 Open","description":""}},"children":["INPUT_POL_DOOR1_OPEN"]},"INPUT_DOOR2_OPEN":{"@parent":"","@translations":{"english":{"name":"Door 2 Open","description":""}},"children":["INPUT_POL_DOOR2_OPEN"]},"INPUT_CLEAR_FAULTS":{"@parent":"","@translations":{"english":{"name":"Clear Faults","description":""}},"children":["INPUT_POL_CLEAR_FAULTS"]},"INPUT_CIP":{"@parent":"","@translations":{"english":{"name":"CIP","description":""}},"children":["INPUT_POL_CIP"]},"INPUT_PROD_SEL1":{"@parent":"","@translations":{"english":{"name":"Product Select 1","description":""}},"children":["INPUT_POL_PROD_SEL1"]},"INPUT_PROD_SEL2":{"@parent":"","@translations":{"english":{"name":"Product Select 2","description":""}},"children":["INPUT_POL_PROD_SEL2"]},"INPUT_PROD_SEL3":{"@parent":"","@translations":{"english":{"name":"Product Select 3","description":""}},"children":["INPUT_POL_PROD_SEL3"]},"INPUT_PROD_SEL4":{"@parent":"","@translations":{"english":{"name":"Product Select 4","description":""}},"children":["INPUT_POL_PROD_SEL4"]},"INPUT_TEST":{"@parent":"","@translations":{"english":{"name":"Test","description":""}},"children":["INPUT_POL_TEST"]},"OUT_PHY_PL3_1":{"@parent":"","@translations":{"english":{"name":"PL3 1","description":""}},"children":["OUT_POL_PL3_1"]},"OUT_PHY_PL11_1A2":{"@parent":"","@translations":{"english":{"name":"PL11 1A2","description":""}},"children":["OUT_POL_PL11_1A2"]},"OUT_PHY_PL11_3A4":{"@parent":"","@translations":{"english":{"name":"PL11 3A4","description":""}},"children":["OUT_POL_PL11_3A4"]},"OUT_PHY_PL11_5A6":{"@parent":"","@translations":{"english":{"name":"PL11 5A6","description":""}},"children":["OUT_POL_PL11_5A6"]},"OUT_PHY_PL4_1":{"@parent":"","@translations":{"english":{"name":"PL4 1","description":""}},"children":["OUT_POL_PL4_1"]},"OUT_PHY_PL4_2":{"@parent":"","@translations":{"english":{"name":"PL4 2","description":""}},"children":["OUT_POL_PL4_2"]},"OUT_PHY_PL4_3":{"@parent":"","@translations":{"english":{"name":"PL4 3","description":""}},"children":["OUT_POL_PL4_3"]},"OUT_PHY_PL4_5":{"@parent":"","@translations":{"english":{"name":"PL4 5","description":""}},"children":["OUT_POL_PL4_5"]},"OUT_PHY_IO_PL3_R1":{"@parent":"","@translations":{"english":{"name":"IO PL3 R1","description":""}},"children":["OUT_POL_IO_PL3_R1"]},"OUT_PHY_IO_PL3_R2":{"@parent":"","@translations":{"english":{"name":"IO PL3 R2","description":""}},"children":["OUT_POL_IO_PL3_R2"]},"OUT_PHY_IO_PL3_O1":{"@parent":"","@translations":{"english":{"name":"IO PL3 O1","description":""}},"children":["OUT_POL_IO_PL3_O1"]},"OUT_PHY_IO_PL3_O2":{"@parent":"","@translations":{"english":{"name":"IO PL3 O2","description":""}},"children":["OUT_POL_IO_PL3_O2"]},"OUT_PHY_IO_PL3_O3":{"@parent":"","@translations":{"english":{"name":"IO PL3 O3","description":""}},"children":["OUT_POL_IO_PL3_O3"]},"OUT_PHY_IO_PL4_02":{"@parent":"","@translations":{"english":{"name":"IO PL4 02","description":""}},"children":["OUT_POL_IO_PL4_02"]},"OUT_PHY_IO_PL4_03":{"@parent":"","@translations":{"english":{"name":"IO PL4 03","description":""}},"children":["OUT_POL_IO_PL4_03"]},"OUT_PHY_IO_PL4_04":{"@parent":"","@translations":{"english":{"name":"IO PL4 04","description":""}},"children":["OUT_POL_IO_PL4_04"]},"OUT_PHY_IO_PL4_05":{"@parent":"","@translations":{"english":{"name":"IO PL4 05","description":""}},"children":["OUT_POL_IO_PL4_05"]},"SRecordDate":{"@parent":"","@translations":{"english":{"name":"System Record Date","description":""}},"children":[]},"ProdNo":{"@parent":"","@translations":{"english":{"name":"Product Number","description":""}},"children":[]},"Unit":{"@parent":"","@translations":{"english":{"name":"Unit","description":""}},"children":[]},"RefFaultMask":{"@parent":"","@translations":{"english":{"name":"Reference Fault","description":""}},"children":[]},"BalFaultMask":{"@parent":"","@translations":{"english":{"name":"Balance Fault","description":""}},"children":[]},"ProdMemFaultMask":{"@parent":"","@translations":{"english":{"name":"Product Memory Fault","description":""}},"children":[]},"RejConfirmFaultMask":{"@parent":"","@translations":{"english":{"name":"Reject Confirm Fault","description":""}},"children":[]},"PhaseFaultMask":{"@parent":"","@translations":{"english":{"name":"Phase Fault","description":""}},"children":[]},"TestSigFaultMask":{"@parent":"","@translations":{"english":{"name":"Test Signal Fault","description":""}},"children":[]},"PeyeBlockFaultMask":{"@parent":"","@translations":{"english":{"name":"Photoeye Block Fault","description":""}},"children":[]},"RejBinFullFaultMask":{"@parent":"","@translations":{"english":{"name":"Reject Bin Full Fault","description":""}},"children":[]},"AirFaultMask":{"@parent":"","@translations":{"english":{"name":"Air Fault","description":""}},"children":[]},"ExcessRejFaultMask":{"@parent":"","@translations":{"english":{"name":"Excess Rejects Fault","description":""}},"children":[]},"BigMetalFaultMask":{"@parent":"","@translations":{"english":{"name":"Large Metal Fault","description":""}},"children":[]},"NetBufferFaultMask":{"@parent":"","@translations":{"english":{"name":"Net Buffer Fault","description":""}},"children":[]},"RejMemoryFaultMask":{"@parent":"","@translations":{"english":{"name":"Reject Memory Fault","description":""}},"children":[]},"RejectExitFaultMask":{"@parent":"","@translations":{"english":{"name":"Reject Exit Fault","description":""}},"children":[]},"TachometerFaultMask":{"@parent":"","@translations":{"english":{"name":"Tachometer Fault","description":""}},"children":[]},"PatternFaultMask":{"@parent":"","@translations":{"english":{"name":"Pattern Fault","description":""}},"children":[]},"ExitNoPackFaultMask":{"@parent":"","@translations":{"english":{"name":"Exit No Pack Fault","description":""}},"children":[]},"ExitNewPackFaultMask":{"@parent":"","@translations":{"english":{"name":"Exit New Pack Fault","description":""}},"children":[]},"InterceptorFaultMask":{"@parent":"","@translations":{"english":{"name":"Interceptor Fault","description":""}},"children":[]},"RtcLowBatFaultMask":{"@parent":"","@translations":{"english":{"name":"Rtc Low Batter Fault","description":""}},"children":[]},"RtcTimeFaultMask":{"@parent":"","@translations":{"english":{"name":"Rtc Time Fault","description":""}},"children":[]},"IntUsbFaultMask":{"@parent":"","@translations":{"english":{"name":"Int Usb Fault","description":""}},"children":[]},"IoBoardFaultMask":{"@parent":"","@translations":{"english":{"name":"IO Board Fault","description":""}},"children":[]},"HaloFaultMask":{"@parent":"","@translations":{"english":{"name":"Halo Fault","description":""}},"children":[]},"SignalFaultMask":{"@parent":"","@translations":{"english":{"name":"Signal Fault","description":""}},"children":[]}},"@netpollsmap":{"NET_POLL_PROTOCOL_VERSION":{"@translations":{"english":""}},"NET_POLL_KEY_CLASS_MASK":{"@translations":{"english":""}},"NET_POLL_PROD_REC_VAR":{"@translations":{"english":""}},"NET_POLL_PROD_SYS_VAR":{"@translations":{"english":""}},"NET_POLL_REJECT":{"@translations":{"english":""}},"NET_POLL_REJECT2":{"@translations":{"english":""}},"NET_POLL_REJ_CNT":{"@translations":{"english":""}},"NET_POLL_FAULT":{"@translations":{"english":""}},"NET_POLL_CONTROL":{"@translations":{"english":""}},"NET_POLL_POWERUP":{"@translations":{"english":""}},"NET_POLL_OPERATOR_NO":{"@translations":{"english":""}},"NET_POLL_TEST_REQ_PASS":{"@translations":{"english":""}},"NET_POLL_REJECT_ID":{"@translations":{"english":""}},"NET_POLL_REJECT_CLEAR":{"@translations":{"english":""}},"NET_POLL_EYE_PROD_PEAK":{"@translations":{"english":""}},"NET_POLL_EYE_PROD_PHASE":{"@translations":{"english":""}},"NET_POLL_FAULT_CLEAR":{"@translations":{"english":""}},"NET_POLL_SYNC_MENU":{"@translations":{"english":""}},"NET_POLL_PWD_ENTRY_1":{"@translations":{"english":""}},"NET_POLL_PWD_ENTRY_2":{"@translations":{"english":""}},"NET_POLL_SEL_UNIT":{"@translations":{"english":""}},"NET_POLL_RESERVED":{"@translations":{"english":""}},"NET_POLL_CLEAR_SCOPE":{"@translations":{"english":""}},"NET_POLL_REJECT_PHASE":{"@translations":{"english":""}},"NET_POLL_FLASH_WRITE":{"@translations":{"english":""}},"NET_POLL_INTCPTR_SWITCH":{"@translations":{"english":""}},"NET_POLL_PREC_DELETE":{"@translations":{"english":""}},"NET_POLL_PREC_DEL_ALL":{"@translations":{"english":""}},"NET_POLL_PREC_BACKUP_SAVE":{"@translations":{"english":""}},"NET_POLL_PREC_BACKUP_RESTORE":{"@translations":{"english":""}},"NET_POLL_PREC_DEAULTS":{"@translations":{"english":""}},"NET_POLL_PREC_COPY":{"@translations":{"english":""}},"NET_POLL_REJECT2_ID":{"@translations":{"english":""}},"NET_POLL_REJECT2_CLEAR":{"@translations":{"english":""}}},"@pages":{"Sens":{"cat":"Sens","params":["Sens","DetThresh","ThresProdHi","ThresX","ThresR","BigMetThres","DetMode","NoiseR","NoiseX","DetThEst"],"subCats":[]},"Calibration":{"cat":"Calibration","params":[],"subCats":[{"cat":"Phase","params":["PhaseAngle","PhaseAngleAuto","PhaseMode","PhaseSpeed","PhaseFastBit","PhaseWetBit","PhaseDSALearn"],"subCats":[]},{"cat":"MPhase","params":["MPhaseOrder","MPhaseDD","MPhaseRD"],"subCats":[]}]},"Test":{"cat":"Test","params":["TestTime","TestDeferTime","TestMode"],"subCats":[{"cat":"Manual","params":["TestConfigCount0_0","TestConfigCount0_1","TestConfigCount0_2","TestConfigAck0","TestConfigOperator0","TestConfigHaloMode0"],"subCats":[]},{"cat":"Halo","params":["TestConfigCount1_0","TestConfigCount1_1","TestConfigCount1_2","TestConfigAck1","TestConfigOperator1","TestConfigHaloMode1"],"subCats":[]},{"cat":"Manual2","params":["TestConfigCount2_0","TestConfigCount2_1","TestConfigCount2_2","TestConfigAck2","TestConfigOperator2","TestConfigHaloMode2"],"subCats":[]},{"cat":"Halo2","params":["TestConfigCount3_0","TestConfigCount3_1","TestConfigCount3_2","TestConfigAck3","TestConfigOperator3","TestConfigHaloMode3"],"subCats":[]},{"cat":"HaloConf","params":["HaloPeakRFe","HaloPeakXFe","HaloPeakRNFe","HaloPeakXNFe","HaloPeakRSs","HaloPeakXSs"],"subCats":[]}]}},"@catmap":{"Reject":{"@translations":{"english":"Reject"}},"Password":{"@translations":{"english":"Password"}},"IO":{"@translations":{"english":"I/O"}},"System":{"@translations":{"english":"System"}},"Fault":{"@translations":{"english":"Faults"}},"Reject/Additional Settings":{"@translations":{"english":"Additional Settings"}},"Reject/Additional Settings/Distances":{"@translations":{"english":"Distances"}},"Reject/Additional Settings/Belt Speed":{"@translations":{"english":"Belt Speed"}},"Reject/Additional Settings/Latch":{"@translations":{"english":"Latches"}},"Reject/Additional Settings/Clocks":{"@translations":{"english":"Clocks"}},"IO/Inputs":{"@translations":{"english":"Inputs"}},"IO/Outputs":{"@translations":{"english":"Outputs"}},"Sens":{"@translations":{"english":"Sensitivity"}},"Test":{"@translations":{"english":"Test"}},"Test/Manual":{"@translations":{"english":"Manual Test 1"}},"Test/Halo":{"@translations":{"english":"Halo Test 1"}},"Test/Manual2":{"@translations":{"english":"Manual Test 2"}},"Test/Halo2":{"@translations":{"english":"Halo Test 2"}},"Test/HaloConf":{"@translations":{"english":"Test Configuration"}},"Calibration":{"@translations":{"english":"Calibration"}},"Calibration/Phase":{"@translations":{"english":"Phase"}},"Calibration/MPhase":{"@translations":{"english":"M Phase"}}}
}
var vdefMap = {
  "@vmap":{"SRecordDate":{"@category":"System","@parent":"*","@translations":{"english":{"name":"System Record Date","description":"The date code for the system record."},"portuguese":{"name":"Registro do Sistema","description":"Codigo do Registro do Sistema"}}},"ProdNo":{"@category":"Prod","@parent":"*","@translations":{"english":{"name":"Product Number","description":""},"portuguese":{"name":"Número do Produto","description":""}}},"INPUT_POL_TACH":{"@category":"*","@parent":"INPUT_TACH","@translations":{"english":{"name":"Tachometer Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_EYE":{"@category":"*","@parent":"INPUT_EYE","@translations":{"english":{"name":"Infeed Eye Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_RC_1":{"@category":"*","@parent":"INPUT_RC_1","@translations":{"english":{"name":"Reject Check 1 Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_RC_2":{"@category":"*","@parent":"INPUT_RC_2","@translations":{"english":{"name":"Reject Check 2 Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_REJ_EYE":{"@category":"*","@parent":"INPUT_REJ_EYE","@translations":{"english":{"name":"Reject Eye Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_AIR_PRES":{"@category":"*","@parent":"INPUT_AIR_PRES","@translations":{"english":{"name":"Air Pressure Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_REJ_LATCH":{"@category":"*","@parent":"INPUT_REJ_LATCH","@translations":{"english":{"name":"Reject Latch Clear Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_BIN_FULL":{"@category":"*","@parent":"INPUT_BIN_FULL","@translations":{"english":{"name":"Bin Full Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_REJ_PRESENT":{"@category":"*","@parent":"INPUT_REJ_PRESENT","@translations":{"english":{"name":"Reject Present Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_DOOR1_OPEN":{"@category":"*","@parent":"INPUT_DOOR1_OPEN","@translations":{"english":{"name":"Bin Door 1 Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_DOOR2_OPEN":{"@category":"*","@parent":"INPUT_DOOR2_OPEN","@translations":{"english":{"name":"Bin Door 2 Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_CLEAR_FAULTS":{"@category":"*","@parent":"INPUT_CLEAR_FAULTS","@translations":{"english":{"name":"Clear Faults Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_CIP":{"@category":"*","@parent":"INPUT_CIP","@translations":{"english":{"name":"CIP Polarity","description":"Clean In Place"},"portuguese":{"name":"","description":""}}},"INPUT_POL_PROD_SEL1":{"@category":"*","@parent":"INPUT_PROD_SEL1","@translations":{"english":{"name":"Product Select 1 Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_PROD_SEL2":{"@category":"*","@parent":"INPUT_PROD_SEL2","@translations":{"english":{"name":"Product Select 2 Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_PROD_SEL3":{"@category":"*","@parent":"INPUT_PROD_SEL3","@translations":{"english":{"name":"Product Select 3 Polarity","description":""},"portuguese":{"name":"","description":""}}},"INPUT_POL_PROD_SEL4":{"@category":"*","@parent":"INPUT_PROD_SEL4","@translations":{"english":{"name":"Product Select 4 Polarity","description":""},"portuguese":{"name":"","description":""}}},"Unit":{"@category":"System","@parent":"*","@translations":{"english":{"name":"Unit","description":""},"portuguese":{"name":"Unidade","description":""}}},"PW1":{"@category":"*","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"PW2":{"@category":"*","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"PW3":{"@category":"*","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"PW4":{"@category":"*","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"HeadDepth":{"@category":"RejSys/Dsit","@parent":"*","@translations":{"english":{"name":"Head Depth","description":""},"portuguese":{"name":"Profundidade da Cabeça","description":""}}},"HeadCoilSp":{"@category":"RejSys/Dsit","@parent":"*","@translations":{"english":{"name":"Coil Spacing","description":""},"portuguese":{"name":"Espaçamento da Bobina","description":""}}},"EyeDist":{"@category":"RejSys/Dsit","@parent":"*","@translations":{"english":{"name":"Infeed Eye Distance","description":""},"portuguese":{"name":"Distânçia da Fotocélula Entrada","description":""}}},"RejExitDist":{"@category":"RejSys/Dsit","@parent":"*","@translations":{"english":{"name":"Exit Eye Disatnce","description":""},"portuguese":{"name":"Distânçia da Fotocélula de Saída","description":""}}},"RejExitWin":{"@category":"RejSys/Dsit","@parent":"*","@translations":{"english":{"name":"Exit Window","description":""},"portuguese":{"name":"Janela de Saída","description":""}}},"RejBinDoorTime":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Bin Door Timer","description":""},"portuguese":{"name":"Cronômetro do Portão de Rejecão","description":""}}},"HaloPeakRFe":{"@category":"Test/HaloConfig","@parent":"*","@translations":{"english":{"name":"Ferrous R Peak","description":""},"portuguese":{"name":"Pico R Ferroso","description":""}}},"HaloPeakXFe":{"@category":"Test/HaloConfig","@parent":"*","@translations":{"english":{"name":"Ferrous X Peak","description":""},"portuguese":{"name":"Pico X Ferroso","description":""}}},"HaloPeakRNFe":{"@category":"Test/HaloConfig","@parent":"*","@translations":{"english":{"name":"Non-Ferrous R Peak","description":""},"portuguese":{"name":"Pico R Não-Ferroso","description":""}}},"HaloPeakXNFe":{"@category":"Test/HaloConfig","@parent":"*","@translations":{"english":{"name":"Non-Ferrous X Peak","description":""},"portuguese":{"name":"Pico X Não-Ferroso","description":""}}},"HaloPeakRSs":{"@category":"Test/HaloConfig","@parent":"*","@translations":{"english":{"name":"Stainless Steel R Peak","description":""},"portuguese":{"name":"Pico R Aço Inoxidável","description":""}}},"HaloPeakXSs":{"@category":"Test/HaloConfig","@parent":"*","@translations":{"english":{"name":"Stainless Steel X Peak","description":""},"portuguese":{"name":"Pico X Aço Inoxidável","description":""}}},"CIPCycleTime":{"@category":"IOconf/CIP","@parent":"*","@translations":{"english":{"name":"CIP Cycle Time","description":""},"portuguese":{"name":"Tempo de Ciclo CIP","description":""}}},"CIPDwellTime":{"@category":"IOconf/CIP","@parent":"*","@translations":{"english":{"name":"CIP Dwell Time","description":""},"portuguese":{"name":"Tempo de Permanência CIP","description":""}}},"INPUT_TACH":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Tachometer","description":""},"portuguese":{"name":"Tacômetro","description":""}}},"INPUT_EYE":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Infeed Eye","description":""},"portuguese":{"name":"Fotocélula de Entrada","description":""}}},"INPUT_RC_1":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Reject Check 1","description":""},"portuguese":{"name":"Comfirmação de Rejeição 1","description":""}}},"INPUT_RC_2":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Reject Check 2 ","description":""},"portuguese":{"name":"Comfirmação de Rejeição 2","description":""}}},"INPUT_REJ_EYE":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Exit Eye","description":""},"portuguese":{"name":"Fotocélula de Saída","description":""}}},"INPUT_AIR_PRES":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Air Pressure","description":""},"portuguese":{"name":"Pressão do Ar","description":""}}},"INPUT_REJ_LATCH":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Latch Clear","description":""},"portuguese":{"name":"Reset do Latch","description":""}}},"INPUT_BIN_FULL":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Bin Full","description":""},"portuguese":{"name":"Caixa de Rejeção Cheia","description":""}}},"INPUT_REJ_PRESENT":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Reject Present","description":""},"portuguese":{"name":"Rejeção Presente","description":""}}},"INPUT_DOOR1_OPEN":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Door 1","description":""},"portuguese":{"name":"Portão 1","description":""}}},"INPUT_DOOR2_OPEN":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Door 2","description":""},"portuguese":{"name":"Portão 2","description":""}}},"INPUT_CLEAR_FAULTS":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Clear Faults","description":""},"portuguese":{"name":"Limpar Falhas","description":""}}},"INPUT_CIP":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Clean in Place","description":""},"portuguese":{"name":"Clean in Place","description":""}}},"INPUT_PROD_SEL1":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Product Select 1","description":""},"portuguese":{"name":"Selecionar Produto 1","description":""}}},"INPUT_PROD_SEL2":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Product Select 2","description":""},"portuguese":{"name":"Selecionar Produto 2","description":""}}},"INPUT_PROD_SEL3":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Product Select 3","description":""},"portuguese":{"name":"Selecionar Produto 3","description":""}}},"INPUT_PROD_SEL4":{"@category":"IOconf/Input","@parent":"*","@translations":{"english":{"name":"Product Select 4","description":""},"portuguese":{"name":"Selecionar Produto 4","description":""}}},"OUT_PHY_PL3_1":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"PL3","description":""},"portuguese":{"name":"PL3","description":""}}},"OUT_PHY_PL11_1A2":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"PL11-1/2","description":""},"portuguese":{"name":"PL11-1/2","description":""}}},"OUT_PHY_PL11_3A4":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"PL11-3/4","description":""},"portuguese":{"name":"PL11-3/4","description":""}}},"OUT_PHY_PL11_5A6":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"PL11-5/6","description":""},"portuguese":{"name":"PL11-5/6","description":""}}},"OUT_PHY_PL4_1":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"PL4-1","description":""},"portuguese":{"name":"PL4-1","description":""}}},"OUT_PHY_PL4_2":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"PL4-2","description":""},"portuguese":{"name":"PL4-2","description":""}}},"OUT_PHY_PL4_3":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"PL4-3","description":""},"portuguese":{"name":"PL4-3","description":""}}},"OUT_PHY_PL4_5":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"PL4-5","description":""},"portuguese":{"name":"PL4-5","description":""}}},"OUT_PHY_PL5_1A2":{"@category":"IOconf/Output","@translations":{"english":{"name":"PL5-1/2","description":""},"portuguese":{"name":"PL5-1/2","description":""}},"@parent":"*"},"OUT_PHY_PL5_3A4":{"@category":"IOconf/Output","@translations":{"english":{"name":"PL5-3/4","description":""},"portuguese":{"name":"PL5-3/4","description":""}},"@parent":"*"},"OUT_PHY_PL5_5A6":{"@category":"IOconf/Output","@translations":{"english":{"name":"PL5-5/6","description":""},"portuguese":{"name":"PL5-5/6","description":""}},"@parent":"*"},"OUT_PHY_IO_PL3_R1":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"IO Board - R1","description":""},"portuguese":{"name":"Placa I/O - R1","description":""}}},"OUT_PHY_IO_PL3_R2":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"IO Board - R2","description":""},"portuguese":{"name":"Placa I/O - R2","description":""}}},"OUT_PHY_IO_PL3_O1":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"IO Board - O1","description":""},"portuguese":{"name":"Placa I/O - O1","description":""}}},"OUT_PHY_IO_PL3_O2":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"IO Board - O2","description":""},"portuguese":{"name":"Placa I/O - O2","description":""}}},"OUT_PHY_IO_PL3_O3":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"IO Board - O3","description":""},"portuguese":{"name":"Placa I/O - O3","description":""}}},"OUT_PHY_IO_PL4_02":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"IO Board - PL4-2","description":""},"portuguese":{"name":"Placa I/O - PL4-2","description":""}}},"OUT_PHY_IO_PL4_03":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"IO Board - PL4-3","description":""},"portuguese":{"name":"Placa I/O - PL4-3","description":""}}},"OUT_PHY_IO_PL4_04":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"IO Board - PL4-4","description":""},"portuguese":{"name":"Placa I/O - PL4-4","description":""}}},"OUT_PHY_IO_PL4_05":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"IO Board - PL4-5","description":""},"portuguese":{"name":"Placa I/O - PL4-5","description":""}}},"Language":{"@category":"System","@parent":"*","@translations":{"english":{"name":"Language","description":""},"portuguese":{"name":"Lígua","description":""}}},"PassAccSens":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Sensitivity","description":""},"portuguese":{"name":"Sensibilidade","description":""}}},"PassAccProd":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Product","description":""},"portuguese":{"name":"Produto","description":""}}},"PassAccCal":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Calabration","description":""},"portuguese":{"name":"Calibração","description":""}}},"PassAccTest":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Test","description":""},"portuguese":{"name":"Teste","description":""}}},"PassAccSelUnit":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Select Unit","description":""},"portuguese":{"name":"Selecionar Unidade","description":""}}},"PassAccClrFaults":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Clear Faults","description":""},"portuguese":{"name":"Limpar Falhas","description":""}}},"PassAccClrRej":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Clear Rejects","description":""},"portuguese":{"name":"Limpar Rejeições","description":""}}},"PassAccClrLatch":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Clear Latch","description":""},"portuguese":{"name":"Limpar Latch","description":""}}},"PassAccTime":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Time","description":""},"portuguese":{"name":"Hora","description":""}}},"PassAccSync":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Sync Data","description":""},"portuguese":{"name":"Sincronizar Dados","description":""}}},"HaloBoard":{"@category":"Test/HaloConfig","@parent":"*","@translations":{"english":{"name":"Halo Board","description":""},"portuguese":{"name":"Placa Halo","description":""}}},"UnitMode":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Unit Mode","description":""},"portuguese":{"name":"Mode de Unidade","description":""}}},"PassOn":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Password Enabled","description":""},"portuguese":{"name":"Habilitar Senha","description":""}}},"AppUnitDist":{"@category":"RejSys/Dsit","@parent":"*","@translations":{"english":{"name":"Units","description":""},"portuguese":{"name":"Unidades","description":""}}},"FaultLatch":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Fault Latch","description":""},"portuguese":{"name":"Latch de Falhas","description":""}}},"BacklightOn":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Backlight","description":""},"portuguese":{"name":"Retroiluminaçao","description":""}}},"PowerupRej":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Reject on Powerup","description":""},"portuguese":{"name":"Rejeitar ao Ligar","description":""}}},"FaultStore":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Fault Store","description":""},"portuguese":{"name":"Armazenamento de Falhas","description":""}}},"BannerRejMode":{"@category":"IOconf/LtStk","@parent":"*","@translations":{"english":{"name":"Light Stack Mode","description":""},"portuguese":{"name":"Modo Torre de Luz","description":""}}},"BannerBuzzMode":{"@category":"IOconf/LtStk","@parent":"*","@translations":{"english":{"name":"Buzzer","description":""},"portuguese":{"name":"Campainha","description":""}}},"IOBoardType":{"@category":"IOconf","@parent":"*","@translations":{"english":{"name":"IO Board Type","description":""},"portuguese":{"name":"Tipo de Placa I/O","description":""}}},"FaultClearTime":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Fault Clear Time","description":""},"portuguese":{"name":"Tempo de limpeza de Falhas","description":""}}},"PRecordDate":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Product Record Date","description":""},"portuguese":{"name":"Data de Registro de Produto","description":""}}},"ProdName":{"@category":"Prod","@parent":"*","@translations":{"english":{"name":"Product Name","description":""},"portuguese":{"name":"Nome do Produto","description":""}}},"BeltSpeed":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Belt Speed","description":""},"portuguese":{"name":"Velocidade da Esteira","description":""}}},"RefFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Referance","description":""},"portuguese":{"name":"Referência","description":""}}},"BalFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Balance","description":""},"portuguese":{"name":"Balance","description":""}}},"ProdMemFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Product Memory","description":""},"portuguese":{"name":"Memoria do Produto","description":""}}},"RejConfirmFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Reject Confirm","description":""},"portuguese":{"name":"Comfirmaçao de Rejeição ","description":""}}},"PhaseFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Phase","description":""},"portuguese":{"name":"Fase","description":""}}},"TestSigFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Test","description":""},"portuguese":{"name":"Teste","description":""}}},"PeyeBlockFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Eye Block","description":""},"portuguese":{"name":"Fotocélula Bloqueado","description":""}}},"RejBinFullFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Reject Bin Full","description":""},"portuguese":{"name":"Caixa de Rejeção Cheia","description":""}}},"AirFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Air","description":""},"portuguese":{"name":"Ar","description":""}}},"ExcessRejFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Excess Rejects","description":""},"portuguese":{"name":"Excesso de Rejeição","description":""}}},"BigMetalFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Large Metal","description":""},"portuguese":{"name":"Metal Grande","description":""}}},"NetBufferFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Net Buffer","description":""},"portuguese":{"name":"Net Buffer","description":""}}},"RejMemoryFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Reject Memory","description":""},"portuguese":{"name":"Memória de Rejeçao","description":""}}},"RejBinDoorFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Bin Door","description":""},"portuguese":{"name":"Portão da Caixa","description":""}}},"RejectExitFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Exit","description":""},"portuguese":{"name":"Saída","description":""}}},"TachometerFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Tachometer","description":""},"portuguese":{"name":"Tacômetro","description":""}}},"PatternFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"DSA","description":""},"portuguese":{"name":"DSA","description":""}}},"ExitNoPackFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Exit - No Pack","description":""},"portuguese":{"name":"Saída - sem Produto","description":""}}},"ExitNewPackFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Exit - New Pack","description":""},"portuguese":{"name":"Saída - Novo Produto","description":""}}},"InterceptorFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Interceptor","description":""},"portuguese":{"name":"Interceptor","description":""}}},"RtcLowBatFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Low Battery","description":""},"portuguese":{"name":"Bateria Baixa","description":""}}},"RtcTimeFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Time","description":""},"portuguese":{"name":"Hora","description":""}}},"IntUsbFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Internal USB","description":""},"portuguese":{"name":"USB Interno","description":""}}},"IoBoardFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"IO Board","description":""},"portuguese":{"name":"Placa I/O","description":""}}},"HaloFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Halo","description":""},"portuguese":{"name":"Halo","description":""}}},"SignalFaultMask":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"","description":"Signal"},"portuguese":{"name":"Sinal","description":""}}},"AutoPhasePacks":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Auto Phase Packs","description":""},"portuguese":{"name":"Pacote Fase Auto","description":""}}},"PhaseTrigLimit":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Phase Trigger Limit","description":""},"portuguese":{"name":"Phase Trigger Limit","description":""}}},"PhaseTrigThres":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Phase Trigger Threshold","description":""},"portuguese":{"name":"Phase Tigger Threshhold","description":""}}},"EyePkgLength":{"@category":"RejSys/Dsit","@parent":"*","@translations":{"english":{"name":"Package Length","description":""},"portuguese":{"name":"Comprimento do Pacote","description":""}}},"EyeMinGapDist":{"@category":"RejSys/Dsit","@parent":"*","@translations":{"english":{"name":"Minimum Package Gap","description":""},"portuguese":{"name":"Gap Miníma entre Produtos","description":""}}},"EyeBlockTime":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Eye Block Time","description":""},"portuguese":{"name":"Tempo de Fotocélula Bloqueada","description":""}}},"RejTravDel":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Delay","description":""},"portuguese":{"name":"Atrazo","description":""}}},"RejTravDur":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Duration","description":""},"portuguese":{"name":"Duração","description":""}}},"RejDelSec":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Delay","description":""},"portuguese":{"name":"Atrazo","description":""}}},"RejDurSec":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Duration","description":""},"portuguese":{"name":"Duração","description":""}}},"RejDelSec2":{"@category":"RejSys/Dsit","@parent":"*","@translations":{"english":{"name":"Delay","description":""},"portuguese":{"name":"Atrazo","description":""}}},"RejDurSec2":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Duration","description":""},"portuguese":{"name":"Duração","description":""}}},"RejCheckTime":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Reject Check TIme","description":""},"portuguese":{"name":"Tempo de Comfirmação de Rejeição","description":""}}},"TestTime":{"@category":"Test","@parent":"*","@translations":{"english":{"name":"Test Time","description":""},"portuguese":{"name":"Teste de Tempo","description":""}}},"ExcessRejects":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Excess Rejects","description":""},"portuguese":{"name":"excesso de Rejeições","description":""}}},"ExcessRejTime":{"@category":"Faults","@parent":"*","@translations":{"english":{"name":"Excess Reject Time","description":""},"portuguese":{"name":"Excesso de Tempo de Rejeição","description":""}}},"OUT_POL_PL3_1":{"@category":"*","@parent":"OUT_PHY_PL3_1","@translations":{"english":{"name":"PL3 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_PL11_1A2":{"@category":"*","@parent":"OUT_PHY_PL11_1A2","@translations":{"english":{"name":"PL11-1/2  Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_PL11_3A4":{"@category":"*","@parent":"OUT_PHY_PL11_3A4","@translations":{"english":{"name":"PL11-3/4  Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_PL11_5A6":{"@category":"*","@parent":"OUT_PHY_PL11_5A6","@translations":{"english":{"name":"PL11-5/6  Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_PL4_1":{"@category":"*","@parent":"OUT_PHY_PL4_1","@translations":{"english":{"name":"PL4-1 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_PL4_2":{"@category":"*","@parent":"OUT_PHY_PL4_2","@translations":{"english":{"name":"PL4-2 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_PL4_3":{"@category":"*","@parent":"OUT_PHY_PL4_3","@translations":{"english":{"name":"PL4-3 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_PL4_5":{"@category":"*","@parent":"OUT_PHY_PL4_5","@translations":{"english":{"name":"PL4-5 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_PL5_1A2":{"@category":"*","@translations":{"english":{"name":"PL5-1/2","description":""},"portuguese":{"name":"","description":""}},"@parent":"OUT_PHY_PL5_1A2"},"OUT_POL_PL5_3A4":{"@category":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"OUT_PHY_PL5_3A4"},"OUT_POL_PL5_5A6":{"@category":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"OUT_PHY_PL5_5A6"},"OUT_POL_IO_PL3_R1":{"@category":"*","@parent":"OUT_PHY_IO_PL3_R1","@translations":{"english":{"name":"IO_PL3_R1 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_IO_PL3_R2":{"@category":"*","@parent":"OUT_PHY_IO_PL3_R2","@translations":{"english":{"name":"IO_PL3_R2 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_IO_PL3_O1":{"@category":"*","@parent":"OUT_PHY_IO_PL3_O1","@translations":{"english":{"name":"IO_PL3_O1 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_IO_PL3_O2":{"@category":"*","@parent":"OUT_PHY_IO_PL3_O2","@translations":{"english":{"name":"IO_PL3_O2 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_IO_PL3_O3":{"@category":"*","@parent":"OUT_PHY_IO_PL3_O3","@translations":{"english":{"name":"IO_PL3_03 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_IO_PL4_02":{"@category":"*","@parent":"OUT_PHY_IO_PL4_02","@translations":{"english":{"name":"IO_PL4_2 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_IO_PL4_03":{"@category":"*","@parent":"OUT_PHY_IO_PL4_03","@translations":{"english":{"name":"IO_PL4_3 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"OUT_POL_IO_PL4_04":{"@category":"*","@parent":"OUT_PHY_IO_PL4_04","@translations":{"english":{"name":"IO_PL4_4 Output Polarity","description":""},"portuguese":{"name":"","description":""}}},"FilterNoise":{"@category":"System","@parent":"*","@translations":{"english":{"name":"Filter","description":""},"portuguese":{"name":"Filtro","description":""}}},"Sens":{"@category":"Sens","@parent":"*","@translations":{"english":{"name":"Sensitivity","description":""},"portuguese":{"name":"Sensibilidade","description":""}}},"Sens_A":{"@category":"Sens","@parent":"*","@translations":{"english":{"name":"Sensitivity","description":""},"portuguese":{"name":"Sensibilidade","description":""}}},"Sens_B":{"@category":"Sens","@parent":"Sens_A","@translations":{"english":{"name":"Sensitivity","description":""},"portuguese":{"name":"","description":""}}},"DcCoeffNorm":{"@category":"System","@parent":"*","@translations":{"english":{"name":"DC Coeffecent","description":""},"portuguese":{"name":"Coeficiente CC","description":""}}},"DetThresh":{"@category":"Sens","@parent":"*","@translations":{"english":{"name":"Detection Threshold","description":""},"portuguese":{"name":"Limite de Detecçao","description":""}}},"ThresProdHi":{"@category":"Sens","@parent":"*","@translations":{"english":{"name":"Product High Threshold","description":""},"portuguese":{"name":"Limite Alto do produto","description":""}}},"ThresX":{"@category":"Sens","@parent":"*","@translations":{"english":{"name":"X Channel Threshold","description":""},"portuguese":{"name":"Limite do Canal X","description":""}}},"ThresR":{"@category":"Sens","@parent":"*","@translations":{"english":{"name":"R Channel Threshold","description":""},"portuguese":{"name":"Limite do Canal R","description":""}}},"BigMetThres":{"@category":"Sens","@parent":"*","@translations":{"english":{"name":"Large Metal Threshold","description":""},"portuguese":{"name":"Limite de Metal Grande","description":""}}},"PhaseLimitDry":{"@category":"Phase/lim","@parent":"*","@translations":{"english":{"name":"Dry Phase Limit","description":""},"portuguese":{"name":"Limite de Fase Seco","description":""}}},"PhaseLimitDrySpread":{"@category":"Phase/lim","@parent":"*","@translations":{"english":{"name":"Dry Phase Spread","description":""},"portuguese":{"name":"Espalhamento da Fase Seco","description":""}}},"PhaseLimitWet":{"@category":"Phase/lim","@parent":"*","@translations":{"english":{"name":"Wet Phase Limit","description":""},"portuguese":{"name":"Limite da Fase Úmido","description":""}}},"PhaseLimitWetSpread":{"@category":"Phase/lim","@parent":"*","@translations":{"english":{"name":"Wet Phase Spread","description":""},"portuguese":{"name":"Espalhamento da Fase Úmido","description":""}}},"PhaseAngle":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Phase","description":""},"portuguese":{"name":"Fase","description":""}}},"MPhaseOrder":{"@category":"Phase/MPhase","@parent":"*","@translations":{"english":{"name":"MPhase Order","description":""},"portuguese":{"name":"MPhase Order","description":""}}},"MPhaseDD":{"@category":"Phase/MPhase","@parent":"*","@translations":{"english":{"name":"MPhase Det","description":""},"portuguese":{"name":"MPhase Det","description":""}}},"MPhaseRD":{"@category":"Phase/MPhase","@parent":"*","@translations":{"english":{"name":"MPhase Ret","description":""},"portuguese":{"name":"MPhase Ret","description":""}}},"PhaseSpeed":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Phase Speed","description":""},"portuguese":{"name":"Velocidade da Fase","description":""}}},"OscPower":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Osclator Power","description":""},"portuguese":{"name":"Potêcia do Ocilador","description":""}}},"PhaseMode":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Phase Mode","description":""},"portuguese":{"name":"Modo da Fase","description":""}}},"PhaseModeHold":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Phase Mode Hold","description":""},"portuguese":{"name":"Segurar Modo da Fase","description":""}}},"DetMode":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Detection Mode","description":""},"portuguese":{"name":"Modo de Detecção","description":""}}},"TestConfigCount0_0":{"@category":"*","@parent":"TestConfigMetal0_0","@translations":{"english":{"name":"Test Count 1","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq0_0":{"@category":"*","@parent":"TestConfigMetal0_0","@translations":{"english":{"name":"Test Frequency 1","description":""},"portuguese":{"name":"","description":""}}},"TestConfigMetal0_0":{"@category":"Test/Manual","@parent":"*","@translations":{"english":{"name":"Test Type 1","description":""},"portuguese":{"name":"Tipo de Teste 1","description":""}}},"TestConfigCount0_1":{"@category":"*","@parent":"TestConfigMetal0_1","@translations":{"english":{"name":"Test Count 2","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq0_1":{"@category":"*","@parent":"TestConfigMetal0_1","@translations":{"english":{"name":"Test Frequency 2","description":""},"portuguese":{"name":"","description":""}}},"TestConfigMetal0_1":{"@category":"Test/Manual","@parent":"*","@translations":{"english":{"name":"Test Type 2","description":""},"portuguese":{"name":"Tipo de Teste 2","description":""}}},"TestConfigCount0_2":{"@category":"*","@parent":"TestConfigMetal0_2","@translations":{"english":{"name":"Test Count 3","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq0_2":{"@category":"*","@parent":"TestConfigMetal0_2","@translations":{"english":{"name":"Test Frequency 3","description":""},"portuguese":{"name":"","description":""}}},"TestConfigCount0_3":{"@category":"*","@parent":"TestConfigMetal0_3","@translations":{"english":{"name":"Test Count 4","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq0_3":{"@category":"*","@parent":"TestConfigMetal0_3","@translations":{"english":{"name":"Test Frequency 4","description":""},"portuguese":{"name":"","description":""}}},"TestConfigCount0_4":{"@category":"*","@parent":"TestConfigMetal0_4","@translations":{"english":{"name":"Test Count 5","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq0_4":{"@category":"*","@parent":"TestConfigMetal0_4","@translations":{"english":{"name":"Test Frequency 5","description":""},"portuguese":{"name":"","description":""}}},"TestConfigCount0_5":{"@category":"*","@parent":"TestConfigMetal0_5","@translations":{"english":{"name":"Test Count 6","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq0_5":{"@category":"*","@parent":"TestConfigMetal0_5","@translations":{"english":{"name":"Test Frequency 6","description":""},"portuguese":{"name":"","description":""}}},"TestConfigMetal0_2":{"@category":"Test/Manual","@parent":"*","@translations":{"english":{"name":"Test Type 3","description":""},"portuguese":{"name":"Tipo de Teste 3","description":""}}},"TestConfigMetal0_3":{"@category":"Test/Manual","@parent":"*","@translations":{"english":{"name":"Test Type 4","description":""},"portuguese":{"name":"Tipo de Teste 3","description":""}}},"TestConfigMetal0_4":{"@category":"Test/Manual","@parent":"*","@translations":{"english":{"name":"Test Type 5","description":""},"portuguese":{"name":"Tipo de Teste 3","description":""}}},"TestConfigMetal0_5":{"@category":"Test/Manual","@parent":"*","@translations":{"english":{"name":"Test Type 6","description":""},"portuguese":{"name":"Tipo de Teste 3","description":""}}},"TestConfigAck0":{"@category":"Test/Manual","@parent":"*","@translations":{"english":{"name":"Acknowledge","description":""},"portuguese":{"name":"Comfirmação","description":""}}},"TestConfigOperator0":{"@category":"Test/Manual","@parent":"*","@translations":{"english":{"name":"Operator","description":""},"portuguese":{"name":"Operador","description":""}}},"TestConfigHaloMode0":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Halo Mode","description":""},"portuguese":{"name":"Modo Halo","description":""}}},"TestConfigCount1_0":{"@category":"*","@parent":"TestConfigMetal1_0","@translations":{"english":{"name":"Test Count 1","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq1_0":{"@category":"*","@parent":"TestConfigMetal1_0","@translations":{"english":{"name":"Test Frequency 1","description":""},"portuguese":{"name":"","description":""}}},"TestConfigMetal1_0":{"@category":"Test/Halo","@parent":"*","@translations":{"english":{"name":"Test Type 1","description":""},"portuguese":{"name":"Tipo de Teste 1","description":""}}},"TestConfigCount1_1":{"@category":"*","@parent":"TestConfigMetal1_1","@translations":{"english":{"name":"Test Count 2","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq1_1":{"@category":"*","@parent":"TestConfigMetal1_1","@translations":{"english":{"name":"Test Count 2","description":""},"portuguese":{"name":"","description":""}}},"TestConfigMetal1_1":{"@category":"Test/Halo","@parent":"*","@translations":{"english":{"name":"Test Type 2","description":""},"portuguese":{"name":"Tipo de teste 2","description":""}}},"TestConfigCount1_2":{"@category":"*","@parent":"TestConfigMetal1_2","@translations":{"english":{"name":"Test Count 3","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq1_2":{"@category":"*","@parent":"TestConfigMetal1_2","@translations":{"english":{"name":"Test Count 3","description":""},"portuguese":{"name":"","description":""}}},"TestConfigCount1_3":{"@category":"*","@parent":"TestConfigMetal1_3","@translations":{"english":{"name":"Test Count 4","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq1_3":{"@category":"*","@parent":"TestConfigMetal1_3","@translations":{"english":{"name":"Test Count 4","description":""},"portuguese":{"name":"","description":""}}},"TestConfigCount1_4":{"@category":"*","@parent":"TestConfigMetal1_4","@translations":{"english":{"name":"Test Count 5","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq1_4":{"@category":"*","@parent":"TestConfigMetal1_4","@translations":{"english":{"name":"Test Count 5","description":""},"portuguese":{"name":"","description":""}}},"TestConfigCount1_5":{"@category":"*","@parent":"TestConfigMetal1_5","@translations":{"english":{"name":"Test Count 6","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq1_5":{"@category":"*","@parent":"TestConfigMetal1_5","@translations":{"english":{"name":"Test Count 6","description":""},"portuguese":{"name":"","description":""}}},"TestConfigMetal1_2":{"@category":"Test/Halo","@parent":"*","@translations":{"english":{"name":"Test Type 3","description":""},"portuguese":{"name":"Tipo de Teste 3","description":""}}},"TestConfigMetal1_3":{"@category":"Test/Halo","@parent":"*","@translations":{"english":{"name":"Test Type 4","description":""},"portuguese":{"name":"Tipo de Teste 3","description":""}}},"TestConfigMetal1_4":{"@category":"Test/Halo","@parent":"*","@translations":{"english":{"name":"Test Type 5","description":""},"portuguese":{"name":"Tipo de Teste 3","description":""}}},"TestConfigMetal1_5":{"@category":"Test/Halo","@parent":"*","@translations":{"english":{"name":"Test Type 6","description":""},"portuguese":{"name":"Tipo de Teste 3","description":""}}},"TestConfigAck1":{"@category":"Test/Halo","@parent":"*","@translations":{"english":{"name":"Acknowledge","description":""},"portuguese":{"name":"Comfirmação","description":""}}},"TestConfigOperator1":{"@category":"Test/Halo","@parent":"*","@translations":{"english":{"name":"Operator","description":""},"portuguese":{"name":"Operador","description":""}}},"TestConfigHaloMode1":{"@category":"Test/Halo","@parent":"*","@translations":{"english":{"name":"Halo Mode","description":""},"portuguese":{"name":"Modo Halo","description":""}}},"TestConfigCount2_0":{"@category":"*","@parent":"TestConfigMetal2_0","@translations":{"english":{"name":"Test Count 1","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq2_0":{"@category":"*","@parent":"TestConfigMetal2_0","@translations":{"english":{"name":"Test Count 1","description":""},"portuguese":{"name":"","description":""}}},"TestConfigMetal2_0":{"@category":"Test/Manual2","@parent":"*","@translations":{"english":{"name":"Test Type 1","description":""},"portuguese":{"name":"Tipo de Teste 1","description":""}}},"TestConfigCount2_1":{"@category":"*","@parent":"TestConfigMetal2_1","@translations":{"english":{"name":"Test Count 2","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq2_1":{"@category":"*","@parent":"TestConfigMetal2_1","@translations":{"english":{"name":"Test Count 2","description":""},"portuguese":{"name":"","description":""}}},"TestConfigMetal2_1":{"@category":"Test/Manual2","@parent":"*","@translations":{"english":{"name":"Test Type 2","description":""},"portuguese":{"name":"Tipo de Teste 2","description":""}}},"TestConfigCount2_2":{"@category":"*","@parent":"TestConfigMetal2_2","@translations":{"english":{"name":"Test Count 3","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq2_2":{"@category":"*","@parent":"TestConfigMetal2_2","@translations":{"english":{"name":"Test Count 3","description":""},"portuguese":{"name":"","description":""}}},"TestConfigCount2_3":{"@category":"*","@parent":"TestConfigMetal2_3","@translations":{"english":{"name":"Test Count 4","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq2_3":{"@category":"*","@parent":"TestConfigMetal2_3","@translations":{"english":{"name":"Test Count 4","description":""},"portuguese":{"name":"","description":""}}},"TestConfigCount2_4":{"@category":"*","@parent":"TestConfigMetal2_4","@translations":{"english":{"name":"Test Count 5","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq2_4":{"@category":"*","@parent":"TestConfigMetal2_4","@translations":{"english":{"name":"Test Count 5","description":""},"portuguese":{"name":"","description":""}}},"TestConfigCount2_5":{"@category":"*","@parent":"TestConfigMetal2_5","@translations":{"english":{"name":"Test Count 6","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq2_5":{"@category":"*","@parent":"TestConfigMetal2_5","@translations":{"english":{"name":"Test Count 6","description":""},"portuguese":{"name":"","description":""}}},"TestConfigMetal2_2":{"@category":"Test/Manual2","@parent":"*","@translations":{"english":{"name":"Test Type 3","description":""},"portuguese":{"name":"Tipo de Teste 3","description":""}}},"TestConfigMetal2_3":{"@category":"Test/Manual2","@parent":"*","@translations":{"english":{"name":"Test Type 4","description":""},"portuguese":{"name":"Tipo de Teste 3","description":""}}},"TestConfigMetal2_4":{"@category":"Test/Manual2","@parent":"*","@translations":{"english":{"name":"Test Type 5","description":""},"portuguese":{"name":"Tipo de Teste 3","description":""}}},"TestConfigMetal2_5":{"@category":"Test/Manual2","@parent":"*","@translations":{"english":{"name":"Test Type 6","description":""},"portuguese":{"name":"Tipo de Teste 3","description":""}}},"TestConfigAck2":{"@category":"Test/Manual2","@parent":"*","@translations":{"english":{"name":"Acknowledge","description":""},"portuguese":{"name":"Comfirmação","description":""}}},"TestConfigOperator2":{"@category":"Test/Manual2","@parent":"*","@translations":{"english":{"name":"Operator","description":""},"portuguese":{"name":"Operador","description":""}}},"TestConfigHaloMode2":{"@category":"*","@parent":"*","@translations":{"english":{"name":"Halo Mode","description":""},"portuguese":{"name":"Modo Halo","description":""}}},"TestConfigCount3_0":{"@category":"*","@parent":"TestConfigMetal3_0","@translations":{"english":{"name":"Test Count 1","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq3_0":{"@category":"*","@parent":"TestConfigMetal3_0","@translations":{"english":{"name":"Test Count 1","description":""},"portuguese":{"name":"","description":""}}},"TestConfigMetal3_0":{"@category":"Test/Halo2","@parent":"*","@translations":{"english":{"name":"Test Type 1","description":""},"portuguese":{"name":"Tipo de Teste 1","description":""}}},"TestConfigCount3_1":{"@category":"*","@parent":"TestConfigMetal3_1","@translations":{"english":{"name":"Test Count 2","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq3_1":{"@category":"*","@parent":"TestConfigMetal3_1","@translations":{"english":{"name":"Test Count 2","description":""},"portuguese":{"name":"","description":""}}},"TestConfigMetal3_1":{"@category":"Test/Halo2","@parent":"*","@translations":{"english":{"name":"Test Type 2","description":""},"portuguese":{"name":"Tipo de Teste 2","description":""}}},"TestConfigCount3_2":{"@category":"*","@parent":"TestConfigMetal3_2","@translations":{"english":{"name":"Test Count 3","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq3_2":{"@category":"*","@parent":"TestConfigMetal3_2","@translations":{"english":{"name":"Test Count 3","description":""},"portuguese":{"name":"","description":""}}},"TestConfigCount3_3":{"@category":"*","@parent":"TestConfigMetal3_3","@translations":{"english":{"name":"Test Count 4","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq3_3":{"@category":"*","@parent":"TestConfigMetal3_3","@translations":{"english":{"name":"Test Count 4","description":""},"portuguese":{"name":"","description":""}}},"TestConfigCount3_4":{"@category":"*","@parent":"TestConfigMetal3_4","@translations":{"english":{"name":"Test Count 4","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq3_4":{"@category":"*","@parent":"TestConfigMetal3_4","@translations":{"english":{"name":"Test Count 4","description":""},"portuguese":{"name":"","description":""}}},"TestConfigCount3_5":{"@category":"*","@parent":"TestConfigMetal3_5","@translations":{"english":{"name":"Test Count 5","description":""},"portuguese":{"name":"","description":""}}},"TestConfigFreq3_5":{"@category":"*","@parent":"TestConfigMetal3_5","@translations":{"english":{"name":"Test Count 5","description":""},"portuguese":{"name":"","description":""}}},"TestConfigMetal3_2":{"@category":"Test/Halo2","@parent":"*","@translations":{"english":{"name":"Test Type 3","description":""},"portuguese":{"name":"Tipo de Test 3","description":""}}},"TestConfigMetal3_3":{"@category":"Test/Halo2","@parent":"*","@translations":{"english":{"name":"Test Type 4","description":""},"portuguese":{"name":"Tipo de Test 3","description":""}}},"TestConfigMetal3_4":{"@category":"Test/Halo2","@parent":"*","@translations":{"english":{"name":"Test Type 5","description":""},"portuguese":{"name":"Tipo de Test 3","description":""}}},"TestConfigMetal3_5":{"@category":"Test/Halo2","@parent":"*","@translations":{"english":{"name":"Test Type 6","description":""},"portuguese":{"name":"Tipo de Test 3","description":""}}},"TestConfigAck3":{"@category":"Test/Halo2","@parent":"*","@translations":{"english":{"name":"Acknowledge","description":""},"portuguese":{"name":"Comfirmação","description":""}}},"TestConfigOperator3":{"@category":"Test/Halo2","@parent":"*","@translations":{"english":{"name":"Operator","description":""},"portuguese":{"name":"Operador","description":""}}},"TestConfigHaloMode3":{"@category":"Test/Halo2","@parent":"*","@translations":{"english":{"name":"Halo Mode","description":""},"portuguese":{"name":"Modo Halo","description":""}}},"TestDeferTime":{"@category":"Test","@parent":"*","@translations":{"english":{"name":"Test Defer Time","description":""},"portuguese":{"name":"Tempo de Teste Diferente","description":""}}},"RejLatchMode":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Latch Mode","description":""},"portuguese":{"name":"Modo Latch","description":""}}},"EyeDetSwipe":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Eye Swipe","description":""},"portuguese":{"name":"Troca de Fotocélula","description":""}}},"Rej2Latch":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Alt Rject Latch","description":""},"portuguese":{"name":"Rejeição Alternativo","description":""}}},"Rej2Fault":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Reject ","description":""},"portuguese":{"name":"Rejeito","description":""}}},"Rej2Check":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Reject Check 2","description":""},"portuguese":{"name":"Verificação de Rejeição 2","description":""}}},"PeakMode":{"@category":"Prod","@parent":"*","@translations":{"english":{"name":"Peak Reset Mode","description":""},"portuguese":{"name":"Modo Reset do Pico","description":""}}},"RejOnProdHi":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Reject on Product High","description":""},"portuguese":{"name":"Rejeitar Sinal de produto Alto","description":""}}},"SplitPkgLength":{"@category":"RejSys/Dsit","@parent":"*","@translations":{"english":{"name":"Split Package Length","description":""},"portuguese":{"name":"Separar Comprimento do Pacote","description":""}}},"AutoLearn":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Auto Learn","description":""},"portuguese":{"name":"Auto Learn","description":""}}},"RejDelClock":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Reject Clock","description":""},"portuguese":{"name":"Reloj do Rejeito","description":""}}},"RejMode":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Reject Mode","description":""},"portuguese":{"name":"Modo de Rejeição","description":""}}},"EyeReject":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Eye","description":""},"portuguese":{"name":"Fotocélula","description":""}}},"RejCheckMode":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Reject Check Mode","description":""},"portuguese":{"name":"Modo Verificação de rejeição","description":""}}},"FaultRejMode":{"@category":"RejSys","@parent":"*","@translations":{"english":{"name":"Fault Reject Mode","description":""},"portuguese":{"name":"Modo Rejeição de Falhas","description":""}}},"TestMode":{"@category":"Test","@parent":"*","@translations":{"english":{"name":"Test Mode","description":""},"portuguese":{"name":"Modo Teste","description":""}}},"LightStackMode":{"@category":"IOconf/Output","@parent":"*","@translations":{"english":{"name":"Light Stack Mode","description":""},"portuguese":{"name":"Modo Torre de Luz","description":""}}},"ActiveProduct":{"@category":"Prod","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"RefFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"BalFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"ProdMemFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"RejConfirmFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"PhaseFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"TestSigFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"PeyeBlockFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"RejBinFullFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"AirFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"ExcessRejFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"BigMetalFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"NetBufferFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"RejMemoryFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"RejBinDoorFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"RejectExitFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"TachometerFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"PatternFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"ExitNoPackFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"ExitNewPackFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"InterceptorFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"RtcLowBatFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"RtcTimeFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"IntUsbFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"IoBoardFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"HaloFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"SignalFault":{"@category":"Faults","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"DateTime":{"@category":"System","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"PackCount":{"@category":"RejSys","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"BeltSpeedEst":{"@category":"RejSys","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"RejCount":{"@category":"System","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"EncFreq":{"@category":"System","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"DetectSignal":{"@category":"RejSys/Dsit","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"Peak":{"@category":"Prod","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"PhaseAngleAuto":{"@category":"Phase","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"ProdPeakR":{"@category":"Phase","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"ProdPeakX":{"@category":"Phase","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"NoiseR":{"@category":"Phase","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"NoiseX":{"@category":"Phase","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"DetThEst":{"@category":"Phase","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"SysFreq":{"@category":"System","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"SysBal":{"@category":"System","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"SysRef":{"@category":"System","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"Prod_LED":{"@category":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"Prod_HI_LED":{"@category":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"Reject_LED":{"@category":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"PhaseDSALearn":{"@category":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"PhaseWetBit":{"@category":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"PhaseFastBit":{"@category":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"IOBoardLocate":{"@category":"System","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"HaloLocate":{"@category":"System","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"XPortIP":{"@category":"System","@translations":{"english":{"name":"External IP","description":""},"portuguese":{"name":"IP Externo","description":""}},"@parent":"*"},"InternalIP":{"@category":"System","@translations":{"english":{"name":"Internal IP","description":""},"portuguese":{"name":"IP Interno","description":""}},"@parent":"*"},"IOBoardIP":{"@category":"System","@translations":{"english":{"name":"IO Board IP","description":""},"portuguese":{"name":"IP Placa I/O","description":""}},"@parent":"*"},"HaloIP":{"@category":"System","@translations":{"english":{"name":"Halo Board IP","description":""},"portuguese":{"name":"IP Placa Halo","description":""}},"@parent":"*"},"DspName":{"@category":"System","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"DspSerNo":{"@category":"System","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}},"@parent":"*"},"FilterNoise_A":{"@category":"System","@parent":"*","@translations":{"english":{"name":"Filter","description":""},"portuguese":{"name":"Filtro","description":""}}},"FilterNoise_B":{"@category":"System","@parent":"FilterNoise_A","@translations":{"english":{"name":"Filter","description":""},"portuguese":{"name":"","description":""}}},"DcCoeffNorm_A":{"@category":"System","@parent":"*","@translations":{"english":{"name":"DC Coeffecent","description":""},"portuguese":{"name":"Coeficiente CC","description":""}}},"DcCoeffNorm_B":{"@category":"System","@parent":"DcCoeffNorm_A","@translations":{"english":{"name":"DC Coeffecent","description":""},"portuguese":{"name":"","description":""}}},"DetThresh_A":{"@category":"Sens","@parent":"*","@translations":{"english":{"name":"Detection Threshold","description":""},"portuguese":{"name":"Limite de Detecção","description":""}}},"DetThresh_B":{"@category":"Sens","@parent":"DetThresh_A","@translations":{"english":{"name":"Detection Threshold","description":""},"portuguese":{"name":"","description":""}}},"ThresProdHi_A":{"@category":"Sens","@parent":"*","@translations":{"english":{"name":"Product High Threshold","description":""},"portuguese":{"name":"Limite do Sinal Alto do Produto","description":""}}},"ThresProdHi_B":{"@category":"Sens","@parent":"ThresProdHi_A","@translations":{"english":{"name":"Product High Threshold","description":""},"portuguese":{"name":"","description":""}}},"ThresX_A":{"@category":"Sens","@parent":"*","@translations":{"english":{"name":"X Channel Threshold","description":""},"portuguese":{"name":"Limite Canal X","description":""}}},"ThresX_B":{"@category":"Sens","@parent":"ThresX_A","@translations":{"english":{"name":"X Channel Threshold","description":""},"portuguese":{"name":"","description":""}}},"ThresR_A":{"@category":"Sens","@parent":"*","@translations":{"english":{"name":"R Channel Threshold","description":""},"portuguese":{"name":"Limite Canal R","description":""}}},"ThresR_B":{"@category":"Sens","@parent":"ThresR_A","@translations":{"english":{"name":"R Channel Threshold","description":""},"portuguese":{"name":"","description":""}}},"BigMetThres_A":{"@category":"Sens","@parent":"*","@translations":{"english":{"name":"Large Metal Threshold","description":""},"portuguese":{"name":"Limite Metal Grande","description":""}}},"BigMetThres_B":{"@category":"Sens","@parent":"BigMetThres_A","@translations":{"english":{"name":"Large Metal Threshold","description":""},"portuguese":{"name":"","description":""}}},"PhaseLimitDry_A":{"@category":"Phase/lim","@parent":"*","@translations":{"english":{"name":"Dry Phase Limit","description":""},"portuguese":{"name":"Limite da Fase Seco","description":""}}},"PhaseLimitDry_B":{"@category":"Phase","@parent":"PhaseLimitDry_A","@translations":{"english":{"name":"Dry Phase Limit","description":""},"portuguese":{"name":"","description":""}}},"PhaseLimitDrySpread_A":{"@category":"Phase/lim","@parent":"*","@translations":{"english":{"name":"Dry Phase Spread","description":""},"portuguese":{"name":"","description":""}}},"PhaseLimitDrySpread_B":{"@category":"Phase","@parent":"PhaseLimitDrySpread_A","@translations":{"english":{"name":"Dry Phase Spread","description":""},"portuguese":{"name":"","description":""}}},"PhaseLimitWet_A":{"@category":"Phase/lim","@parent":"*","@translations":{"english":{"name":"Wet Phase Limit","description":""},"portuguese":{"name":"Limite da Fase Úmido","description":""}}},"PhaseLimitWet_B":{"@category":"Phase","@parent":"PhaseLimitWet_A","@translations":{"english":{"name":"Wet Phase Limit","description":""},"portuguese":{"name":"","description":""}}},"PhaseLimitWetSpread_A":{"@category":"Phase/lim","@parent":"*","@translations":{"english":{"name":"Wet Phase Spread","description":""},"portuguese":{"name":"","description":""}}},"PhaseLimitWetSpread_B":{"@category":"Phase","@parent":"PhaseLimitWetSpread_A","@translations":{"english":{"name":"Wet Phase Spread","description":""},"portuguese":{"name":"","description":""}}},"PhaseAngle_A":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Phase","description":""},"portuguese":{"name":"Fase","description":""}}},"PhaseAngle_B":{"@category":"Phase","@parent":"PhaseAngle_A","@translations":{"english":{"name":"Phase","description":""},"portuguese":{"name":"","description":""}}},"MPhaseOrder_A":{"@category":"Phase/MPhase","@parent":"*","@translations":{"english":{"name":"MPhase Order","description":""},"portuguese":{"name":"MPhase Order","description":""}}},"MPhaseOrder_B":{"@category":"Phase/MPhase","@parent":"MPhaseOrder_A","@translations":{"english":{"name":"MPhase Order","description":""},"portuguese":{"name":"","description":""}}},"MPhaseDD_A":{"@category":"Phase/MPhase","@parent":"*","@translations":{"english":{"name":"MPhase Det","description":""},"portuguese":{"name":"MPhase Det","description":""}}},"MPhaseDD_B":{"@category":"Phase/MPhase","@parent":"MPhaseDD_A","@translations":{"english":{"name":"MPhase Det","description":""},"portuguese":{"name":"","description":""}}},"MPhaseRD_A":{"@category":"Phase/MPhase","@parent":"*","@translations":{"english":{"name":"MPhase Ret","description":""},"portuguese":{"name":"MPhase Ret","description":""}}},"MPhaseRD_B":{"@category":"Phase/MPhase","@parent":"MPhaseRD_A","@translations":{"english":{"name":"MPhase Ret","description":""},"portuguese":{"name":"","description":""}}},"PhaseSpeed_A":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Phase Speed","description":""},"portuguese":{"name":"Velocidade da Fase","description":""}}},"PhaseSpeed_B":{"@category":"Phase","@parent":"PhaseSpeed_A","@translations":{"english":{"name":"Phase Speed","description":""},"portuguese":{"name":"","description":""}}},"OscPower_A":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Osclator Power","description":""},"portuguese":{"name":"Potência do Oscilador","description":""}}},"OscPower_B":{"@category":"Phase","@parent":"OscPower_A","@translations":{"english":{"name":"Osclator Power","description":""},"portuguese":{"name":"","description":""}}},"PhaseMode_A":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Phase Mode","description":""},"portuguese":{"name":"Modo da Fase","description":""}}},"PhaseMode_B":{"@category":"Phase","@parent":"PhaseMode_A","@translations":{"english":{"name":"Phase Mode","description":""},"portuguese":{"name":"","description":""}}},"PhaseModeHold_A":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Phase Mode Hold","description":""},"portuguese":{"name":"Segurar Modo da Fase","description":""}}},"PhaseModeHold_B":{"@category":"Phase","@parent":"PhaseModeHold_A","@translations":{"english":{"name":"Phase Mode Hold","description":""},"portuguese":{"name":"","description":""}}},"DetMode_A":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Detection Mode","description":""},"portuguese":{"name":"Modo Detecção","description":""}}},"DetMode_B":{"@category":"Phase","@parent":"DetMode_A","@translations":{"english":{"name":"Detection Mode","description":""},"portuguese":{"name":"","description":""}}},"DetectSignal_A":{"@category":"RejSys/Dsit","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"DetectSignal_B":{"@category":"RejSys/Dsit","@parent":"DetectSignal_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"Peak_A":{"@category":"Prod","@parent":"*","@translations":{"english":{"name":"Peak","description":""},"portuguese":{"name":"Pico","description":""}}},"Peak_B":{"@category":"Prod","@parent":"Peak_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"PhaseAngleAuto_A":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"PhaseAngleAuto_B":{"@category":"Phase","@parent":"PhaseAngleAuto_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"ProdPeakR_A":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"ProdPeakR_B":{"@category":"Phase","@parent":"ProdPeakR_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"ProdPeakX_A":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"ProdPeakX_B":{"@category":"Phase","@parent":"ProdPeakX_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"NoiseR_A":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"R Noise","description":""},"portuguese":{"name":"Ruído R","description":""}}},"NoiseR_B":{"@category":"Phase","@parent":"NoiseR_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"NoiseX_A":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"C Noise","description":""},"portuguese":{"name":"Ruído C","description":""}}},"NoiseX_B":{"@category":"Phase","@parent":"NoiseX_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"DetThEst_A":{"@category":"Phase","@parent":"*","@translations":{"english":{"name":"Threshold Estimate","description":""},"portuguese":{"name":"Limite Estimado","description":""}}},"DetThEst_B":{"@category":"Phase","@parent":"DetThEst_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"SysFreq_A":{"@category":"System","@parent":"*","@translations":{"english":{"name":"Detector Frequency","description":""},"portuguese":{"name":"Frequência do Detector","description":""}}},"SysFreq_B":{"@category":"System","@parent":"SysFreq_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"SysBal_A":{"@category":"System","@parent":"*","@translations":{"english":{"name":"Balance Voltage","description":""},"portuguese":{"name":"Voltagem do Balance","description":""}}},"SysBal_B":{"@category":"System","@parent":"SysBal_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"SysRef_A":{"@category":"System","@parent":"*","@translations":{"english":{"name":"Reference Voltage","description":""},"portuguese":{"name":"Voltagem da Referência","description":""}}},"SysRef_B":{"@category":"System","@parent":"SysRef_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"Prod_LED_A":{"@category":"*","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"Prod_LED_B":{"@category":"*","@parent":"Prod_LED_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"Prod_HI_LED_A":{"@category":"*","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"Prod_HI_LED_B":{"@category":"*","@parent":"Prod_HI_LED_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"Reject_LED_A":{"@category":"*","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"Reject_LED_B":{"@category":"*","@parent":"Reject_LED_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"PhaseDSALearn_A":{"@category":"*","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"PhaseDSALearn_B":{"@category":"*","@parent":"PhaseDSALearn_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"PhaseWetBit_A":{"@category":"*","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"PhaseWetBit_B":{"@category":"*","@parent":"PhaseWetBit_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"PhaseFastBit_A":{"@category":"*","@parent":"*","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}},"PhaseFastBit_B":{"@category":"*","@parent":"PhaseFastBit_A","@translations":{"english":{"name":"","description":""},"portuguese":{"name":"","description":""}}}},"@categories":["*","RejSys","RejSys/Dsit","System","IOconf","IOconf/Output","IOconf/Input","Test","Phase","Faults","Sens","Prod","Test/Halo","Test/Halo2","Test/Manual","Test/Manual2","Test/HaloConfig","Phase/MPhase","IOconf/LtStk","IOconf/CIP","Phase/lim",""],"@catmap":["*",{"@name":"RejSys","@translations":{"english":"Reject System","portuguese":"Sistema de Rejeição"}},{"@name":"RejSys/Dsit","@translations":{"english":"Distance","portuguese":"Distância"}},{"@name":"System","@translations":{"english":"System","portuguese":"Sistema"}},{"@name":"IOconf","@translations":{"english":"I/O Configuration","portuguese":"I/O Configuração"}},{"@name":"IOconf/Output","@translations":{"english":"Outputs","portuguese":"Outputs"}},{"@name":"IOconf/Input","@translations":{"english":"Inputs","portuguese":"Inputs"}},{"@name":"Test","@translations":{"english":"Test","portuguese":"Teste"}},{"@name":"Phase","@translations":{"english":"Phase","portuguese":"Fase"}},{"@name":"Faults","@translations":{"english":"Faults","portuguese":"Falhas"}},{"@name":"Sens","@translations":{"english":"Senstivity","portuguese":"Sensibilidade"}},{"@name":"Prod","@translations":{"english":"Product","portuguese":"Produto"}},{"@name":"Test/Halo","@translations":{"english":"Halo","portuguese":"Halo"}},{"@name":"Test/Halo2","@translations":{"english":"Halo 2","portuguese":"Halo 2"}},{"@name":"Test/Manual","@translations":{"english":"Manual","portuguese":"Manual"}},{"@name":"Test/Manual2","@translations":{"english":"Manual 2","portuguese":"Manual 2"}},{"@name":"Test/HaloConfig","@translations":{"english":"Halo Configuration","portuguese":"Configuração do Halo"}},{"@name":"Phase/MPhase","@translations":{"english":"M Phase","portuguese":"M Fase"}},{"@name":"IOconf/LtStk","@translations":{"english":"Light Stack Configuration","portuguese":"Configuração Torre de Luz"}},{"@name":"IOconf/CIP","@translations":{"english":"CIP Configuration","portuguese":"Configuração CIP"}},{"@name":"Phase/lim","@translations":{"english":"Limits","portuguese":"Limites"}},{"@name":"","@translations":{"english":"","portuguese":""}}],"@netpollsmap":{"NET_POLL_PROTOCOL_VERSION":{"@translations":{"english":"Version","portuguese":"Versão"}},"NET_POLL_KEY_CLASS_MASK":{"@translations":{"english":"","portuguese":""}},"NET_POLL_PROD_REC_VAR":{"@translations":{"english":"Product Record","portuguese":"Registro do Produto"}},"NET_POLL_PROD_SYS_VAR":{"@translations":{"english":"System Record","portuguese":"Registro do Sistema"}},"NET_POLL_REJECT":{"@translations":{"english":"Reject","portuguese":"Rejeicão"}},"NET_POLL_REJECT2":{"@translations":{"english":"Reject (low)","portuguese":"Rejeição (baixo)"}},"NET_POLL_REJ_CNT":{"@translations":{"english":"Reject Count","portuguese":"Contador de Rejeição"}},"NET_POLL_FAULT":{"@translations":{"english":"Fault","portuguese":"Falha"}},"NET_POLL_CONTROL":{"@translations":{"english":"","portuguese":""}},"NET_POLL_POWERUP":{"@translations":{"english":"Powered Up","portuguese":"Ligado"}},"NET_POLL_OPERATOR_NO":{"@translations":{"english":"Operator Number","portuguese":"Número do Operador"}},"NET_POLL_TEST_REQ_PASS":{"@translations":{"english":"Test Request Passed","portuguese":"Pedido de Teste Bem Sucedido"}},"NET_POLL_REJECT_ID":{"@translations":{"english":"Reject ID","portuguese":"ID de rejeição"}},"NET_POLL_REJECT_CLEAR":{"@translations":{"english":"Clear Reject","portuguese":"Limpar Rejeição"}},"NET_POLL_EYE_PROD_PEAK":{"@translations":{"english":"Peak","portuguese":"Pico"}},"NET_POLL_EYE_PROD_PHASE":{"@translations":{"english":"Phase","portuguese":"Fase"}},"NET_POLL_FAULT_CLEAR":{"@translations":{"english":"Fault Cleared","portuguese":"Limpar Falhas"}},"NET_POLL_SYNC_MENU":{"@translations":{"english":"Sync","portuguese":"Sincronizar"}},"NET_POLL_PWD_ENTRY_1":{"@translations":{"english":"","portuguese":""}},"NET_POLL_PWD_ENTRY_2":{"@translations":{"english":"","portuguese":""}},"NET_POLL_SEL_UNIT":{"@translations":{"english":"Select Unit","portuguese":"Selecionar Unidade"}},"NET_POLL_RESERVED":{"@translations":{"english":"","portuguese":""}},"NET_POLL_CLEAR_SCOPE":{"@translations":{"english":"","portuguese":""}},"NET_POLL_REJECT_PHASE":{"@translations":{"english":"Phase","portuguese":"Fase"}},"NET_POLL_FLASH_WRITE":{"@translations":{"english":"","portuguese":""}},"NET_POLL_INTCPTR_SWITCH":{"@translations":{"english":"","portuguese":""}},"NET_POLL_PREC_DELETE":{"@translations":{"english":"Product Deleted","portuguese":"Produto Excluido"}},"NET_POLL_PREC_DEL_ALL":{"@translations":{"english":"Delete All","portuguese":"Excluir todos"}},"NET_POLL_PREC_BACKUP_SAVE":{"@translations":{"english":"Product Backed Up","portuguese":"Produto Salvo"}},"NET_POLL_PREC_BACKUP_RESTORE":{"@translations":{"english":"Product Restored","portuguese":"Produto Restaurado"}},"NET_POLL_PREC_DEAULTS":{"@translations":{"english":"Product Defaults","portuguese":"Padrões do Produto"}},"NET_POLL_PREC_COPY":{"@translations":{"english":"Product Copied","portuguese":"Produto Copiado"}},"NET_POLL_REJECT2_ID":{"@translations":{"english":"ID","portuguese":"ID"}},"NET_POLL_REJECT2_CLEAR":{"@translations":{"english":"Reject Cleared","portuguese":"Rejeito Limpo"}}}
}
var vMap = vdefMap["@vmap"];
var categories;
var categoryMap = vdefMap["@catmap"]
var netMap = vdefMap['@netpollsmap']
var catMap = {}
for(var i = 1; i<categoryMap.length; i++){
  catMap[categoryMap[i]["@name"]] = categoryMap[i];
}
var vMapV2 = vdefMapV2["@vMap"]
var categoriesV2 = [vdefMapV2["@categories"]]
var catMapV2 = vdefMapV2["@catmap"]
console.log(catMap)

let vdefList ={};
let vdefByIp = {};
var _Vdef;
var _pVdef;
let isVdefSet = false;
var ftiTouch = true //this.
var _nVdf;

const _ioBits = ['TACH','EYE','RC_1','RC_2','REJ_EYE','AIR_PRES','REJ_LATCH','BIN_FULL','REJ_PRESENT','DOOR1_OPEN','DOOR2_OPEN','CLEAR_FAULTS','CIP','PROD_SEL1','PROD_SEL2','PROD_SEL3','PROD_SEL4',
                  'TEST','NONE','REJ_MAIN','REJ_ALT','FAULT','TEST_REQ','HALO_FE', 'HALO_SS', 'LS_RED','LS_YEL','LS_GRN','LS_BUZ','DOOR_LOCK','SHUTDOWN_LANE']

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
    //console.log(sa)
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val
  }
  static dsp_name_u16_le(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val
  }
  static dsp_serno_u16_le(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val
  }
  static rec_date(val){
    //needs to be swapped..
    //0xac26 -> 0x26ac
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
    //console.log(wet);
    if(wet==0){
      return Params.phase_dry(val);
    }else{
      return Params.phase_wet(val);
    }
  }
  static rej_del(ticks, tack){
    if(tack==0){
      return (ticks/231.0).toFixed(2); //2 decimal float
    }else{
      return ticks;
    }
  }
  static belt_speed(tpm, metric, tack){
    //console.log(tpm);
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
      return ((w & 0xffff).toString(16)) //hex format string
    }).join(',')
  //  console.log(res);
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
    //return val;
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
    //console.log(patt)
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
    //console.log(length)
    for(var i = 0; i<length; i++){
      wArray.push(b.readUInt16BE(i*2));
    }
    //console.log(wArray)
    return wArray;

  }

  static convert_word_array_LE(byteArr){
    var b = new Buffer(byteArr)
    var length = byteArr.length/2;
    var wArray = []
    //console.log(length)
    for(var i = 0; i<length; i++){
      wArray.push(b.readUInt16LE(i*2));
    }
    //console.log(wArray)
    return wArray;

  }
  static ipv4_address(words){
    //todo
    //console.log(ip)
    //return ip
    var str_Words = words.map(function(w){
      return [(w>>8)&0xff,w&0xff].join('.')
    })
    return str_Words.join('.')
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
    uint <<= 32 - nbit;
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
      return Params[p['@type']](sa)
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
          rpc[j] = i16_args[i] & 0xff; j+= 1;
          rpc[j] = (i16_args[i] >> 8) & 0xff; j+= 1;
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
		}
		this.sock.onopen = function (argument) {
			// body...
			self.emit('locateReq');
			self.emit('getPrefs');
		}

	}
	handle(ev,data){
		this.handlers[ev](data)
		data = null;
	}
	on(handle, func){
		//console.log(handle)
		this.handlers[handle] = func
	}
	emit(handle,data){
		if(data){
			console.log('data is present')
		}else{
			console.log('data null')
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

var json = vdf[0];
_Vdef = json

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
        console.log("fault found")
        res[7].push(par)
      }
    }

    _pVdef = res;
    if(json['@defines']['INTERCEPTOR']){
         vdefList[json['@version']] = [json, res, nVdf, categories, [vdefMapV2['@categories']], vdefMapV2['@vMap'], vdefMapV2['@pages']]
        vdefByIp[vdf[1]] = [json, res, nVdf, categories, [vdefMapV2["@categories"]], vdefMapV2['@vMap'], vdefMapV2['@pages']]

    }else{
         vdefList[json['@version']] = [json, res, nVdf, categories, [vdefMapST['@categories']], vdefMapST['@vMap'], vdefMapST['@pages']]
        vdefByIp[vdf[1]] = [json, res, nVdf, categories, [vdefMapST["@categories"]], vdefMapST['@vMap'], vdefMapST['@pages']]

    }
   
    isVdefSet = true;
    
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
    	//console.log(_vmap[p])
    	//console.log(p)
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
//var cat = _cvdf.slice(0)
function iterateCats(cat, pVdef, sysRec, prodRec, _vmap, dynRec){

	cat.params = getParams(cat, pVdef, sysRec, prodRec, _vmap, dynRec)
	var subCats = cat.subCats.map(function (sc) {

		return iterateCats(sc, pVdef, sysRec, prodRec, _vmap, dynRec)
	})
	cat.subCats = subCats;
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

class Container extends React.Component{
	getInitialState(){
		return({ data:[]})
	}
	render(){
		return (<div>
		<LandingPage/>	
			<Notifications/>
		</div>)
	}
}
class LandingPage extends React.Component{
	constructor(props) {
		super(props)
		var minMq = window.matchMedia("(min-width: 400px)");
		var mq = window.matchMedia("(min-width: 850px)");
		mq.addListener(this.listenToMq)
		minMq.addListener(this.listenToMq)
		var mqls = [
			window.matchMedia("(min-width: 321px)"),
			window.matchMedia("(min-width: 376px)"),
			window.matchMedia("(min-width: 426px)")
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		this.state =  ({currentPage:'landing',netpolls:{}, curIndex:0, minMq:minMq, minW:minMq.matches, mq:mq, brPoint:mq.matches, 
			curModal:'add',detectors:[], mbunits:[],ipToAdd:'',curDet:'',dets:[], curUser:'',tmpUid:'',level:5,
			detL:{}, macList:[], tmpMB:{name:'NEW', type:'mb', banks:[]}})
		this.listenToMq = this.listenToMq.bind(this);
		this.locateUnits = this.locateUnits.bind(this);
		this.onNetpoll = this.onNetpoll.bind(this);
		this.onRMsg = this.onRMsg.bind(this);
		this.onParamMsg2 = this.onParamMsg2.bind(this);
		this.ipChanged = this.ipChanged.bind(this);
		this.renderDetectors = this.renderDetectors.bind(this);
		this.showFinder = this.showFinder.bind(this);
		this.switchUnit = this.switchUnit.bind(this);
		this.addMBUnit = this.addMBUnit.bind(this);
		this.editMb = this.editMb.bind(this);
		this.addToTmp = this.addToTmp.bind(this);
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
		//var self = this;
		/*Object.getOwnPropertyNames(this).forEach(function(f){
			this[f] = this[f].bind(this)
		}).bind(this);*/
	}
	listenToMq(argument) {
		// body...
		if(this.refs.dv){
			this.refs.dv.setState({br:this.state.mq.matches})
		}
		this.setState({brPoint:this.state.mq.matches})
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
		socket.on('resetConfirm', function (r) {
			socket.emit('locateReq');
		})
		
		socket.on('netpoll', function(m){
			//////console.log(['73',m])
			self.onNetpoll(m.data, m.det)
			m = null;
		})
		socket.on('prefs', function(f) {
			////console.log(f)
			var detL = self.state.detL
			f.forEach(function (u) {
				u.banks.forEach(function(b){
					detL[b.mac] = null
				})
			})
			self.setState({mbunits:f, detL:detL})
		})
		socket.on('noVdef', function(ip){
			setTimeout(function(){
				socket.emit('vdefReq', ip);
			}, 1000)
		})
		socket.on('locatedResp', function (e) {
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
				////console.log(d)
				socket.emit('vdefReq', d.ip);

			})
			////console.log(dets)
			self.state.mbunits.forEach(function(u){
				u.banks.forEach(function(b) {
					dets[b.mac] = null;
					if(!nps[b.ip]){
						nps[b.ip] = []
					}
					console.log('connectToUnit')
					socket.emit('connectToUnit', b.ip)
				})
			})
			self.setState({dets:e, detL:dets, macList:macs, netpolls:nps})
		});
		
		socket.on('paramMsg2', function(data) {
		//	console.log('on param msg')
			self.onParamMsg2(data.data,data.det) 
			data = null;
		})
		socket.on('rpcMsg', function (data) {
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
		setTimeout(function (argument) {
			// body...
			if(self.state.mbunits.length == 1){
				if(self.state.currentPage == 'landing'){
					if(self.state.mbunits[0].banks.length == 1){
						if(vdefByIp[self.state.mbunits[0].banks[0].ip]){
							self.switchUnit(self.state.mbunits[0].banks[0])
						}else{
							setTimeout(function () {
								// body...
								if(self.state.currentPage == 'landing'){
							
									if(vdefByIp[self.state.mbunits[0].banks[0].ip]){
										self.switchUnit(self.state.mbunits[0].banks[0])
									}
								}
							},2000)
						}
					}
					
				}	
			}
		},800)
	}
	onNetpoll(e,d){
		////console.log([e,d])
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
				console.log('test started: ' + d.ip)
			}else if(e.net_poll_h == 'NET_POLL_TEST_REQ_PASS'){
				console.log('test passed: ' + d.ip)
				//notify.show('Test Passed')
			}

			this.setState({netpolls:nps})
		}
		
	}
	onRMsg(e,d) {
		////console.log([e,d])
		var msg = e.data
		var data = new Uint8Array(msg);

		if(this.refs.dv){
			this.refs.dv.onRMsg(e,d)
		}else if(this.refs[d.ip]){
			this.refs[d.ip].onRMsg(e,d)
		}else {
			var ind = -1
			this.state.mbunits.forEach(function(m,i){
  				m.banks.forEach(function (b) {
  					if(b.ip == d.ip){
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
		if(vdefByIp[d.ip]){
			if(this.refs[d.ip]){
				this.refs[d.ip].onParamMsg2(e);
			}else{
  				var ind = -1;
  				this.state.mbunits.forEach(function(m,i){
  					m.banks.forEach(function (b) {
  						if(b.ip == d.ip){
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
				this.refs.dv.onParamMsg2(e,d)
			}
		}
		e = null;
		d = null;
	}	
	ipChanged(e) {
		e.preventDefault();
		this.setState({ipToAdd:e.target.value})
	}
	renderDetectors () {
		var self = this;
		var units = this.state.detectors.map(function (u) {
			return <SingleUnit ref={u.ip} onSelect={self.switchUnit} unit={u}/>
		})
		return units;
	}
	showFinder() {
		this.refs.findDetModal.toggle();
		this.locateB()
	}
	logoClick() {this.setState({currentPage:'landing'})}
	switchUnit(u) {
		////console.log(u)
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
		if(vdefByIp[dsps[e].ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2){
			tmpdsp.interceptor = true
		}else{
			tmpdsp.interceptor = false
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
		////console.log(['268', 'cancel'])
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
		////console.log('load prefs')
		if(socket.sock.readyState  ==1){
			socket.emit('locateReq');
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
			////console.log(ind)
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
			var nameEdit = 	<CustomKeyboard onFocus={this.addFocus} onRequestClose={this.addClose} onChange={this.changetMBName} ref='an' value={MB.name} onChange={this.onChange} num={false} label={'AlphaNumeric Keyboard - Hello'}/>
			return (<div><label>Name:</label><CustomLabel onClick={this.editName}>{MB.name}</CustomLabel>
					<table><tbody><tr>
					<th>Available Detectors</th><th>Banks</th>
					</tr><tr>
					<td style={{width:300, border:'1px solid black', minHeight:50}}>
						{detectors}
					</td><td style={{width:300,  border:'1px solid black', minHeight:50}}>
						{banks}
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
		console.log(argument)
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
					////console.log('457')
					return <SingleUnit ref={mb.banks[0].ip} onSelect={self.switchUnit} unit={mb.banks[0]}/>	
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
							</tr>
						</tbody>
					</table>
					<Modal ref='findDetModal'>
						{modalContent}
					</Modal>
					<Modal ref='logModal'>
					<LogView netpolls={this.state.netpolls}/>
					</Modal>
				 	{detectors}
				 	{mbunits}
				 		<CustomKeyboard ref='num' value={"102"} onChange={this.onChange} num={true} label={'Numeric Keyboard - 102'}/>
				<CustomKeyboard ref='an' value={"Hello"} onChange={this.onChange} num={false} label={'AlphaNumeric Keyboard - Hello'}/>
			
			</div>)	
	}
	renderDetector() {
		
		return (<DetectorView br={this.state.brPoint} ref='dv' acc={this.state.level} logoClick={this.logoClick} det={this.state.curDet} ip={this.state.curDet.ip} netpolls={this.state.netpolls[this.state.curDet.ip]}/>)
		
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
		console.log('dummy')
	}
	render() {
		var cont;
		if(this.state.currentPage == 'landing'){
			////console.log('here')
			cont = this.renderLanding();
		}else if(this.state.currentPage == 'detector'){
			cont = this.renderDetector();
		}
		return (<div>
		
			{cont}
			
		</div>)
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
/*class AccountControlView extends React.Component{
	getInitialState(){
		return ({userList:[], newuser:'',password:'',level:0})
	}
	logoClick(){
		this.props.logoClick();
	}
	showLogin(){
		this.props.showLogin();
	}
	componentDidMount(){
		var self = this;
		socket.emit('getUsers','data');
		socket.on('userList', function(data){
			self.setState({userList:data})
		})
	}
	addNew(){
		socket.emit('addUser', {id:this.state.newuser, pw:this.state.password, level:parseInt(this.state.level)})
		this.setState({newuser:'', password:'', level:0})
	}
	userNameChange(e){
		this.setState({newuser:e.target.value});
	}
	passwordChange(e){
		this.setState({password:e.target.value});
	}
	levelChange(e){
		this.setState({level:e.target.value})
	}
	render(){
		var cont = '';
		var login = 'login';
		var lstyle = {height: 72,marginRight: 20}
		if(!this.props.minW){
			lstyle = { height: 60, marginRight: 15}
		}
		var users = this.state.userList.map(function(u){
			return(<UserObj user={u}/>)
		})
		if(this.props.active){
			cont = <div><label>Users</label>
				<div>
					{users}
				</div>
				<table><tbody>
				<tr><td>User</td><td><input type='text' onChange={this.userNameChange} value={this.state.newuser}/></td></tr>
				<tr><td>Password</td><td><input type='text' onChange={this.passwordChange} value={this.state.password}/></td></tr>
				<tr><td>level</td><td><input type='text' onChange={this.levelChange} value={this.state.level}/></td></tr>
				<tr><td>test</td><td><KeyboardInput tid="test" value=''/></td></tr>
				</tbody></table>
				<button onClick={this.addNew}>Add User</button>
			</div>
		}else{
			cont = <div><label>Log in as admin to access this page</label></div>
		}
		return(<div className = 'landingPage'>
					<table className='landingMenuTable'>
						<tbody>
							<tr>
								<td><img onClick={this.logoClick}style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
								<td className="buttCell"><button onClick={this.showLogin} className={login}/></td>
							</tr>
						</tbody>
					</table>
					{cont}
			</div>)	
	}
}*/

/*class UserObj extends React.Component{
	delete(){
		socket.emit('delUser', this.props.user.id)
	}
	render(){
		var u = this.props.user
		return(<div><label>{'Username:' + u.id + '  Level:' + u.level}</label><button onClick={this.delete}>Delete This user</button></div>)
	}
}
class LogInControl extends React.Component{
	getInitialState(){
		return ({userName:'',password:'',alert:''})
	}
	componentDidMount(){
		var self = this;
		socket.on('access denied', function(alert){
			self.setState({alert:alert})
		})
	}
	userNameChange(e){
		////console.log(e)
		if(typeof e == 'string'){

			this.setState({userName:e})
		}else if(e.target){
			if(e.target.value){
				this.setState({userName:e.target.value})
			}
		}
	}
	onFocus(){
		this.props.onKeyFocus();
	}
	onRequestClose(){
		this.props.onRequestClose();
	}
	passwordChange(e){
		if(typeof e == 'string'){

			this.setState({password:e})
		}else if(e.target){
			if(e.target.value){
				this.setState({password:e.target.value})
			}
		}
	}
	loginSubmit(){
		socket.emit('login',{id:this.state.userName, pw:this.state.password})
		this.setState({password:'', alert:''})
	}
	logOut(){
		socket.emit('logOut')
	}
	render(){
		if(this.props.level>0){
			return (<div>
				<label>{'Logged In as ' + this.props.userName}</label>
				<button onClick={this.logOut}>Log Out</button>
			</div>)
		}else{
		return (<div>
			<table>
				<tbody>
					<tr><td>Username:</td><td><KeyboardInput onFocus={this.onFocus} onRequestClose={this.onRequestClose} onChange={this.userNameChange} tid='username' value={this.state.userName}/></td></tr>
					<tr><td>Password:</td><td><KeyboardInput onFocus={this.onFocus} onRequestClose={this.onRequestClose} onChange={this.passwordChange} tid='password' value={this.state.password}/></td></tr>
				</tbody>
			</table>
			<label style={{color:'red'}}>{this.state.alert}</label>
			<button onClick={this.loginSubmit}>Log in</button>
		</div>)
		}
	}
}
*/
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
		var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 467px)'),
			window.matchMedia('(min-width: 600px)')
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		var font = 0;
		if(mqls[2].matches){
			font = 2
		}else if(mqls[1].matches){
			font = 1
		}

		this.state = ({
		 sysRec:this.props.sysSettings, prodRec:this.props.prodSettings, dynRec:this.props.dynSettings, mqls:mqls, font:font, data:this.props.data, cob2:this.props.cob2
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
		//this.componentDidMount = this.component
	}
	componentWillReceiveProps(newProps){
		this.setState({data:newProps.data, cob2:newProps.cob2, sysRec:newProps.sysSettings, prodRec:newProps.prodSettings, dynRec:newProps.dynSettings})
	}
	listenToMq() {
		if(this.state.mqls[2].matches){
			this.setState({font:2})
		}else if(this.state.mqls[1].matches){
			this.setState({font:1})
			
		}else if(this.state.mqls[0].matches){
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
		//console.log(ev.srcElement.body)
		var lvl = this.props.data.length
		var len = 0;
		if(lvl > 0){
			len = this.props.data[lvl - 1 ][0].subCats.length + this.props.data[lvl - 1 ][0].params.length
		}
		//	console.log(document.getElementById(this.props.Id).scrollTop)
		if(len > 6){
			if((document.getElementById(this.props.Id).scrollTop) + 390 < len*65){
				this.refs.arrowBot.show();
				//console.log(['show arrow',document.getElementById(this.props.Id).scrollTop])
			}else{
				this.refs.arrowBot.hide();	
				//console.log(document.getElementById(this.props.Id).scrollTop)
			} 
			if(document.getElementById(this.props.Id).scrollTop > 5){
				this.refs.arrowTop.show();
			}else{
				this.refs.arrowTop.hide();
			}
		}
		//console.log(document.getElementById(this.props.Id));
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
		console.log([n,v])
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
				strArg = n['@rpcs']['write'][2]
			}
		
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
		console.log(['1466',n,this.props.cob2,this.props.data])
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
		//var catMap = vdefByIp[this.props.dsp][]
		////console.log(data)
		var lvl = data.length 
		var handler = this.handleItemclick;
		var lab = 'Settings'
		var cvdf = this.props.cvdf
		////console.log(lvl)
		var label = 'Settings'

		var nodes;
		var ft = 25;
		if(this.state.font == 1){
			ft = 20
		}else if(this.state.font == 0){
			ft = 18
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
				nodes.push(<SettingItem2 language={self.props.language} onFocus={this.onFocus} onRequestClose={this.onRequestClose} faultBits={this.props.faultBits}  ioBits={this.props.ioBits} path={'path'} ip={self.props.dsp} ref={ct} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} lkey={ct} name={ct} hasChild={true} data={[this.props.cob2[i],i]} onItemClick={handler} hasContent={true} sysSettings={this.state.sysRec} prodSettings={this.state.prodRec} dynSettings={self.state.dynRec}/>)
			}
			len = catList.length;
			nav = nodes;
		}else{

			var cat = data[lvl - 1 ][0].cat;
			var pathString = ''
			lab = cat//catMap[cat]['@translations']['english']
			if(lvl == 1){
		    	
		    	if(this.props.mode == 'config'){
		    		label == 'Settings'
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
		    	if(this.props.mode == 'config'){
					backBut =(<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5}} src='assets/angle-left.svg'/><label style={{color:'#ccc', fontSize:ft}}>Settings</label></div>)
		
				}else{
					backBut = (<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5}} src='assets/angle-left.svg'/><label style={{color:'#ccc', fontSize:ft}}>{catMapV2[data[0][0].cat]['@translations']['english']}</label></div>)
				}
		    }else{
		    	var bblab = ''
		    	if(this.props.mode == 'config'){
		    		pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
		    		label = catMapV2[pathString]['@translations'][this.props.language];
		    		bblab = catMapV2[data.slice(1,data.length - 1).map(function (d) {return d[0].cat}).join('/')]['@translations'][this.props.language]; 
		    	}else{
		    		pathString = data.map(function (d) {return d[0].cat}).join('/')
		    		label = catMapV2[pathString]['@translations'][this.props.language];
		    		bblab = catMapV2[data.slice(0,data.length - 1).map(function (d) {return d[0].cat}).join('/')]['@translations'][this.props.language]; 
		    	}
		    	backBut = (<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5}} src='assets/angle-left.svg'/><label style={{color:'#ccc', fontSize:ft}}>{bblab}</label></div>)
				
		    	 
		    	
		    }
			nodes = []
			data[lvl - 1 ][0].subCats.forEach(function(sc,i){
			nodes.push(<SettingItem2 language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} faultBits={self.props.faultBits} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={sc.cat} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
					data={[sc,i]} onItemClick={handler} hasContent={true} acc={self.props.accLevel>=accLevel} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec}/>)
			})
			data[lvl - 1 ][0].params.forEach(function (p,i) {
				// body...
					var ind = 0;
					var prms = self.props.cob2[ind].params;
					var sbc = self.props.cob2[ind].subCats;
					while(ind < lvl - 1){
						ind = ind + 1
						prms = sbc[data[ind][1]].params
						sbc = sbc[data[ind][1]].subCats;	
					}
					var d = prms[i]
					var ch = d['@children']
				
					nodes.push(<SettingItem2 language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} faultBits={self.props.faultBits} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={p['@name']} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={p['@name']} name={p['@name']} 
							children={[vdefByIp[self.props.dsp][5][p['@name']].children,ch]} hasChild={false} data={d} onItemClick={handler} hasContent={true}  acc={self.props.accLevel>=accLevel} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec}/>)
					
			})
			len = data[lvl - 1 ][0].subCats.length + data[lvl - 1 ][0].params.length;
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
			<ScrollArrow ref='arrowTop' width={72} marginTop={5} active={SA} mode={'top'} onClick={this.scrollUp}/>
		
			<div className={className}>
							{titlediv}
			
							{nav}
			</div>
			<ScrollArrow ref='arrowBot' width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
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
						<svg onClick={this.onClick} style={{position:'fixed',marginTop:this.props.marginTop,marginLeft:this.props.width/-2,marginRight:'auto',width:this.props.width,height:this.props.width, strokeWidth:'2%'}} xmlns="http://www.w3.org/2000/svg" fill="#e1e1e1" viewBox="0 0 24 24" ><path stroke="#000"  d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>								
					</div>
		}
		return <div className='scrollArrow' hidden={!(this.props.active && this.state.visible)}>
			<svg onClick={this.onClick} style={{position:'fixed',marginTop:this.props.marginTop, marginLeft:this.props.width/-2,marginRight:'auto',width:this.props.width,height:this.props.width, strokeWidth:'2%'	}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e1e1e1"><path stroke="#000"  d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"/></svg>								
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
		this.props.sendPacket(n,v)	
	}
	componentWillReceiveProps (newProps) {
		// body...
		this.setState({font:newProps.font})
	}
	onItemClick(){
		if(this.props.hasChild || typeof this.props.data == 'object'){
			console.log([this.props.data])
			this.props.onItemClick(this.props.data, this.props.name)	
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
			var res = vdefByIp[this.props.ip];
			var pVdef = _pVdef;
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
								console.log(d)
								////console.log(['1208',self.props.sysSettings])
								return self.props.prodSettings[d];
							}
						});
					}
					if(pram['@bit_len']<=16){
						val = Params[f].apply(this, [].concat.apply([], [val, deps]));
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
						deps = pram["@dep"].map(function(d){
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else{
								return self.props.prodSettings[d];
							}
						});
					}
					if(pram['@bit_len']<=16){
						val = Params[f].apply(this, [].concat.apply([], [val, deps]));
					}
					
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
						deps = pram["@dep"].map(function(d){
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else if(pVdef[5][d]["@rec"] == 1){
								return self.props.prodSettings[d];
							}else if(pVdef[5][d]["@rec"] == 2){
							//		console.log(['1521',pVdef[5][d], self.props.dynSettings[d]])
								return self.props.dynSettings[d];
							}
						});
					}
					if(pram['@bit_len']<=16){
						val = Params[f].apply(this, [].concat.apply([], [val, deps]));
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
			var res = vdefByIp[this.props.ip];
			var pVdef = _pVdef;
			if(res){
				pVdef = res[1];
			}
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
				////console.log('1270')
				namestring = catMapV2[path]['@translations'][this.props.language]
				////console.log('1272')

			}
			//	console.log(namestring)		
					
		return (<div className='sItem hasChild' onClick={this.onItemClick}><label>{namestring}</label></div>)
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
				////console.log('1270')
				namestring = catMapV2[path]['@translations'][this.props.language]
				////console.log('1272')
			}
				////console.log(['1195', this.props.name, this.props.data])
			//		console.log(namestring)		
				return (<div className='sItem hasChild' onClick={this.onItemClick}><label>{namestring}</label></div>)
			}else{
				val = [this.getValue(this.props.data['@data'], this.props.lkey)]
				////console.log(['1250',this.props.lkey, typeof this.props.data['@data']])
				////console.log(['1251', pVdef, pram])
				if(typeof pVdef[0][this.props.lkey] != 'undefined'){
					pram = [pVdef[0][this.props.lkey]]
				}else if(typeof pVdef[1][this.props.lkey] != 'undefined'){
					pram = [pVdef[1][this.props.lkey]]
				}else if(typeof pVdef[2][this.props.lkey] != 'undefined'){
					pram = [pVdef[2][this.props.lkey]]
				}

				if(this.props.data['@children']){
					////console.log(['1346', this.props.data.children])
					for(var i=0;i<this.props.children[0].length;i++){
						val.push(this.getValue(this.props.children[1][i], this.props.children[0][i]))
						if(typeof pVdef[0][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[0][this.props.children[0][i]])
						}else if(typeof pVdef[1][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[1][this.props.children[0][i]])
						}else if(typeof pVdef[2][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[2][this.props.children[0][i]])
						}
					}
				}
				////console.log(['1252',pram])
				if(pram[0]['@labels']){
					label = true
				}	
			}
			}else{


				val = [this.getValue(this.props.data['@data'], this.props.lkey)]
				////console.log(['1250',this.props.lkey, typeof this.props.data])
				////console.log(['1251', pVdef, pram])
				if(typeof pVdef[0][this.props.lkey] != 'undefined'){
					pram = [pVdef[0][this.props.lkey]]
				}else if(typeof pVdef[1][this.props.lkey] != 'undefined'){
					pram = [pVdef[1][this.props.lkey]]
				}else if(typeof pVdef[2][this.props.lkey] != 'undefined'){
					pram = [pVdef[2][this.props.lkey]]
				}
				if(this.props.data['@children']){
					////console.log(['1346', this.props.data.children])
					for(var ch in this.props.data['@children']){
						val.push(this.getValue(this.props.data['@children'][ch], ch))
						if(typeof pVdef[0][ch] != 'undefined'){
							pram.push(pVdef[0][ch])
						}else if(typeof pVdef[1][ch] != 'undefined'){
							pram.push(pVdef[1][ch])
						}else if(typeof pVdef[2][ch] != 'undefined'){
							pram.push(pVdef[2][ch])
						}
					}
				}
				////console.log(['1252',pram])
				if(pram[0]['@labels']){
					label = true
				}
			}
		//		console.log(namestring)		
			
				var edctrl = <EditControl language={this.props.language} ip={this.props.ip} faultBits={this.props.faultBits} ioBits={this.props.ioBits} acc={this.props.acc} onFocus={this.onFocus} onRequestClose={this.onRequestClose} activate={this.activate} ref='ed' vst={vst} lvst={st} param={pram} size={this.state.font} sendPacket={this.sendPacket} data={val} label={label} int={false} name={this.props.lkey}/>
				return (<div className='sItem noChild'> {edctrl}
					</div>)
			
		}
	}
}
/*var KeyboardInputWrapper = createReactClass({
	getInitialState () {
		// body...
		return({value:this.props.value})
	},
	componentWillReceiveProps (newProps) {
		// body...
		if(this.state.value != newProps.value){
			this.setState({value:newProps.value})
		}
	},
	onChange(e){
		console.log(['1412',e])
		if(this.props.onChange){
			this.props.onChange(e, this.props.Id)
		}else{
			if(typeof e != 'string'){
				this.props.onInput(e.target.value, this.props.Id)
			}
			else{
				this.props.onInput(e,this.props.Id)
			}
		}
		
	},
	onInput(e){
		console.log(['1425',e])
		this.props.onInput(e, this.props.Id)
	},
	onFocus () {
		// body...
		if(this.props.onFocus){
			this.props.onFocus();
		}
		
	},	
	onRequestClose () {
		// body...
		if(this.props.onRequestClose){
			this.props.onRequestClose()
		}
	},	
	render(){
		console.log('render key input wrapper..	')
		return(<div style={this.props.Style}><KeyboardInput onFocus={this.onFocus} onRequestClose={this.onRequestClose} onInput={this.onInput} onChange={this.onChange} value={this.state.value} tid={this.props.tid} Style={this.props.Style} num={this.props.num}/></div>)
	},
})
var NestedEditControl = createReactClass({
	getInitialState(){
		return ({val:this.props.data.slice(0), changed:false, mode:0, size:this.props.size})
	},
	componentWillReceiveProps(newProps){
		this.setState({val:newProps.data.slice(0)})
	},
	selectChanged(v,i,j){
		var data = this.state.val;
		data[i][j] = v;
		this.setState({val:data})
		this.props.sendPacket(this.props.param[i][j],v)
	},

	switchMode () {
		// body...
		if(this.props.acc){
			if(this.props.param[0][0]['@rpcs']){
				if((this.props.param[0][0]['@rpcs']['write'])||(this.props.param[0][0]['@rpcs']['toggle'])){
					var m = Math.abs(this.state.mode - 1)
					this.props.activate()
					this.setState({mode:m})
				}
			}
		}	
	},
	render() {
			var namestring = this.props.name
			if(vMap[this.props.name]){
				if(vMap[this.props.name]['@translations']['english']['name'] != ''){
					namestring = vMap[this.props.name]['@translations']['english']['name']
				}
			}
		if(this.state.mode == 0){
			return (<div onClick={this.switchMode}>{namestring}</div>);
		}else{
			var self = this;
			////console.log('line 1264')
			var rows = this.state.val.map(function(r,i){
			var conts = r.map(function (v,j) {
					// body...
			if(self.props.label){

				//return(<SelectForMulti val={v} index={i} index2={j} onChange={self.selectChanged} list={_pVdef[6][self.props.param[0][0]["@labels"]]['english']}/>)
				return(<SelectForMulti val={v} index={i} index2={j} onChange={self.selectChanged} options={_pVdef[6][self.props.param[0][0]["@labels"]]['english']}/>)
				
			}else{
						return(<div style={{display:'inline-block'}}>{v}</div>)
						//return(<KeyboardInput tid={namestring+'_kia'} onInput={self.valChanged} value={v} onKeyPress={this._handleKeyPress} num={num} Style={{width:150}}/>)
					}

				})
				return <div>{conts}</div>
				
			})
		
		return (
			<div><div onClick={this.switchMode}><label>{namestring}</label></div><div>
				{rows}
			</div></div>
		);
		}
		
	}
})*/
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
		var val = v
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
		var value = this.state.val;	
		value[i] = val;
		this.setState({val:value})
		if(!Number.isNaN(val)){
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
		this.props.sendPacket(this.props.param[id])
	}
	openSelector () {
		var self = this;
		if(this.refs.pw){
			setTimeout(function () {
				self.refs.pw.toggleCont();
			},100)
			
		}
		
	}
	valClick (ind) {
		if(this.refs['input' + ind]){
			this.refs['input' + ind].toggle();
		}else if(this.props.param[ind]['@rpcs']){
			if(this.props.param[ind]['@rpcs']['clear']){
				this.onClear(ind)
			}
		}
	}
	render() {
		var namestring = this.props.name
			if(typeof vdefByIp[this.props.ip][5][this.props.name] != 'undefined'){
				if(vdefByIp[this.props.ip][5][this.props.name]['@translations'][this.props.language]['name'] != ''){
					namestring = vdefByIp[this.props.ip][5][this.props.name]['@translations'][this.props.language]['name']
				}
			}
			
		var self = this;
		let lvst = {display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee',lineHeight:'51px'}
	
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
			var vLabels = this.state.val.map(function(d,i){
			var val = d;
			var st = {textAlign:'center',lineHeight:'51px', height:51}
			st.width = labWidth
			st.fontSize = self.props.vst.fontSize;
			st.display = 'table-cell';//self.props.vst.display;
			
			if(isInt){ st.color = colors[i] }

			if(typeof self.props.param[i]['@labels'] != 'undefined'){
				
				val = _pVdef[6][self.props.param[i]["@labels"]]['english'][d]
				if((self.props.param[i]['@labels'] == 'InputSrc')){
					if(self.props.ioBits[inputSrcArr[d]] == 0){
						st.color = '#666'
					}
				}else if((self.props.param[i]['@labels'] == 'OutputSrc')){
					if(self.props.ioBits[outputSrcArr[d]] == 0){
						st.color = '#666'
					}
			}else if((self.props.param[i]['@labels'] == 'FaultMaskBit')){
					if(self.props.faultBits.indexOf(self.props.param[i]['@name'].slice(0,-4)) != -1){
						st.color= '#ffa500'
					}
				}
			}
			return (<CustomLabel index={i} onClick={self.valClick} style={st}>{val}</CustomLabel>)
		})

		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
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
			return(<div><label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee',lineHeight:'51px'}}>{namestring + ': '}</label>
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
						}else{
							return _pVdef[6][p["@labels"]]['english']
						}
					})
					options = <PopoutWheel vMap={this.props.vMap} language={this.props.language}  interceptor={isInt} name={namestring} ref='pw' val={this.state.val} options={lists} onChange={this.selectChanged}/>

					return(<div><div onClick={this.openSelector}><label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee',lineHeight:'51px'}}>{namestring + ': '}</label><div style={vlabelswrapperStyle}><div style={vlabelStyle}>{vLabels}</div></div></div>
					<div style={{paddingLeft:this.props.lvst.width}}>
						{options}
					</div></div>)
				}else{
					options = this.state.val.map(function(v, i){
						if(typeof self.props.param[i]['@labels'] != 'undefined'){

							var opts = _pVdef[6][self.props.param[i]["@labels"]]['english'].map(function(e,i){
								if(i == v){
									return (<option selected value={i}>{e}</option>)

								}else{
									return (<option value={i}>{e}</option>)

								}
							})

							return <PopoutWheel vMap={self.props.vMap} language={this.props.language} interceptor={isInt} name={namestring} ref={'input'+i} val={[v]} options={[_pVdef[6][self.props.param[i]["@labels"]]['english']]} onChange={self.selectChanged} index={i}/>
						}else{
							var num = true
							if(self.props.param[i]['@name'] == 'ProdName'){
								num = false
							}
							var lbl = namestring
							if(isInt){
								lbl = lbl + [' A',' B'][i];
							}
							
							return <CustomKeyboard vMap={self.props.vMap}  onFocus={self.onFocus} ref={'input'+i} onRequestClose={self.onRequestClose} onChange={self.valChanged} index={i} value={v} num={num} label={lbl + ' - ' + v}/>
						}
					})
					return(<div><label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee',lineHeight:'51px'}}>{namestring + ': '}</label><div style={vlabelswrapperStyle}><div style={vlabelStyle}>{vLabels}</div></div>{options}</div>
						
					)
				}


		}
		
	}
}
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
class SelectForMulti extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({val: this.props.val})
		this.onChange = this.onChange.bind(this);
	}
	onChange(e){
		this.setState({val:parseInt(e.target.value)})
		this.props.onChange(parseInt(e.target.value), this.props.index, this.props.index2)
	}
	componentWillReceiveProps(newProps){
		this.setState({val:newProps.val})
	}
	render(){
		var val = this.state.val
		var opts = this.props.list.map(function(e,i){
			if(i == val){
				return (<option selected value={i}>{e}</option>)
			}else{
				return (<option value={i}>{e}</option>)
			}
		})
		return(<div className='customSelect' style={{width:150}}><select onChange={this.onChange}>{opts}</select></div>)
	}
}
class PopoutWheel extends React.Component{
	constructor(props) {
		super(props)
		this.onChange = this.onChange.bind(this);
		this.toggle = this.toggle.bind(this);
		this.toggleCont =this.toggleCont.bind(this);
	}
	onChange (v,i,i2) {
		// body...
		if(typeof this.props.index != 'undefined'){
			this.props.onChange(v,this.props.index)
		}else{
			this.props.onChange(v,i,i2)
		}
		
	}
	toggleCont () {
		// body...
		this.refs.md.toggle();
	}
	toggle () {
		// body...
		this.refs.md.toggle();
	}
	render () {
		// body...
		var value = "placeholder"
		//return(<div  className='customSelect' style={{width:170,   background: 'rgba(255,255,255,0.4)'	}}><div style={{padding:5}}  onClick={this.toggleCont}><div  className='popoutCustomSelect'>{value}</div><div style={{display:'inline-block'}}><img src='assets/dropdown.png' style={{width:30, height:30, marginBottom:-10}}/></div></div>
		return	<PopoutWheelModal vMap={this.props.vMap} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} ref='md' onChange={this.onChange} value={this.props.val} options={this.props.options} ref='md'/>
		//	</div>)
	}
}
class PopoutWheelModal extends React.Component{
	constructor(props) {
		super(props)
		// body...
		this.state = {show:false}
		this.toggle = this.toggle.bind(this);
		this.close = this.close.bind(this);
	}
	toggle () {
		// body...
		this.setState({show:true})
	}
	close () {
		// body...
		var self = this;
		setTimeout(function () {
			// body...
			self.setState({show:false})
		},80)
		
	}
	render () {
		var	cont = ""
		if(this.state.show){
			//		console.log(['2126', this.props.vMap])
		cont =  <PopoutWheelModalCont vMap={this.props.vMap} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.props.onChange} close={this.close} value={this.props.value} options={this.props.options} />
		}
		return <div hidden={!this.state.show} className= 'pop-modal'>
		<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>
			{cont}
		</div>
	}
}
class PopoutWheelModalC extends React.Component{
	constructor(props){
		super(props);
		this.state = {value:this.props.value}
		this.handleClickOutside = this.handleClickOutside.bind(this)
		this.close = this.close.bind(this);
		this.select = this.select.bind(this);
		this.accept = this.accept.bind(this);
		this.help = this.help.bind(this);
	}
	componentDidMount() {
		// body...
		this.setState({value:this.props.value})
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
	select(v, i) {
		// body...
		var values = this.state.value
		values[i] = v;
		this.setState({value:values})
		//this.props.onChange(v,i)
	}
	accept() {
		var self = this;
		if(this.props.value[0] != this.state.value[0]){
			this.props.onChange(this.state.value[0], 0)
			if(this.props.value.length > 1){
				if(this.props.value[1] != this.state.value[1]){
					setTimeout(function () {				// body...
						self.props.onChange(self.state.value[1],1);
						if(self.props.value.length > 2){
							if(self.props.value[2] != self.state.value[2]){
								setTimeout(function () {
									self.props.onChange(self.state.value[2],2)
									self.close();
								},80)
							}else{
								self.close();
							}
						}else{
							self.close();
						}
					},80)
				}else{
					if(this.props.value[2] != this.state.value[2]){
						setTimeout(function () {
							self.props.onChange(self.state.value[2],2)
							self.close();
						},80)
					}else{
						self.close();
					}
				}
			}else{
				this.close();
			}
		}else if(this.props.value.length > 1){
			if(this.props.value[1] != this.state.value[1]){
				this.props.onChange(this.state.value[1],1);
				if(this.props.value.length > 2){
					if(this.props.value[2] != this.state.value[2]){
						setTimeout(function () {
							self.props.onChange(self.state.value[2],2)
							self.close();
						},80)
					}else{
						self.close();
					}
				}else{
					self.close();
				}
			}else{
				if(this.props.value[2] != this.state.value[2]){
					this.props.onChange(this.state.value[2],2)
				}
			this.close();
				
			}
		}else{
			this.close();
		}
		

	}
	help () {
		// body...
		this.refs.helpModal.toggle();
	}
	render () {
		// body...
		var self = this;
		var hs = this.props.options.map(function(op) {
			// body...
			return op.length*40
		})
		var height = hs.reduce(function(a,b){ return Math.max(a,b)});
		if(height > 360){
			height = 360;
		}
		var wheels;
		if(this.state.value.length == 1){
			wheels  = this.state.value.map(function (m,i) {
			// body...
			return <PopoutWheelSelector height={height} interceptor={self.props.interceptor} Id={self.props.name+i} value={m} options={self.props.options[i]} index={i} onChange={self.select}/>
			})
		}else{
			wheels  = this.state.value.map(function (m,i) {
			// body...
		//	console.log(['2258',self.props.vMap,i])
			return <PopoutWheelSelector height={height} label={vdefMapV2['@labels'][self.props.vMap['@labels'][i]][this.props.language]} interceptor={self.props.interceptor} Id={self.props.name+i} value={m} options={self.props.options[i]} index={i} onChange={self.select}/>
			})
		}
		
		var tooltiptext = 'This is a tooltip'
		if(this.props.vMap['@translations']['english']['description'].length >0){
			tooltiptext = this.props.vMap['@translations']['english']['description'];
		}
	  return( <div className='selectmodal-outer'>
	  		<div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:'#fefefe', fontSize:30}}>{this.props.name}</div>
	  		<div onClick={this.help} style={{float:'right', display:'inline-block', marginLeft:-50, marginRight:15, marginTop:6}}><img src='assets/help.svg' width={30}/></div>
	  		<div style={{textAlign:'center', padding:5}}>
	  		{wheels}
	  		</div>
	  		<div><button style={{height:50, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:150, borderRadius:20}} onClick={this.accept}>Accept</button><button style={{height:50, border:'5px solid #808a90', color:'#e1e1e1',background:'#5d5480', width:150, borderRadius:20}} onClick={this.close}>Cancel</button></div>
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
		setScrollTop(this.props.Id,45*this.props.value)
	}
	handleScroll () {
		// body...
		if(this.props.options.length > 8){
			if(document.getElementById(this.props.Id).scrollTop > 5){
				this.refs.arrowTop.show();
			}else{
				this.refs.arrowTop.hide();
			}
			if(document.getElementById(this.props.Id).scrollTop+370 < this.props.options.length*45 ){
				this.refs.arrowBot.show();
			}else{
				this.refs.arrowBot.hide();
			}
		}
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
		var sa = this.props.options.length > 8
		var options = this.props.options.map(function (o,i) {
			// body...
			if(i == self.props.value){

				return <SelectSCModalRow ref={o.toString()} onClick={self.select} value={o} index={i} selected={true}/>
			}else{
				return <SelectSCModalRow ref={o.toString()} onClick={self.select} value={o} index={i} selected={false}/>
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
			<ScrollArrow ref='arrowTop' active={sa} width={48} marginTop={-25}  mode={'top'} onClick={this.scrollUp}/>
			<div id={this.props.Id} onScroll={this.handleScroll} style={{width:220, height:this.props.height, overflowY:'scroll', padding:5, marginLeft:5, marginRight:5, background:'rgba(200,200,200,1)'}}>
				{options}
			</div>
			<ScrollArrow ref='arrowBot' active={sa} width={48} marginTop={-20} mode={'bot'} onClick={this.scrollDown}/>
		
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
			<div  className='customSelect' style={{width:170,   background: 'rgba(255,255,255,0.4)'	}}><div style={{padding:5}}  onClick={this.toggleCont}><div  className='popoutCustomSelect'>{value}</div><div style={{display:'inline-block'}}><img src='assets/dropdown.png' style={{width:30, height:30, marginBottom:-10}}/></div></div>
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
		console.log(['1882',this.props.options[this.props.value]])
		
		this.setState({show:true})
	}
	close () {
		// body...
		console.log(['1882',this.props.options[this.props.value]])
		
		this.setState({show:false})
	}
	render () {
		// body...
		var	cont = ""
		if(this.state.show){
		cont =  <PopoutSelectModalCont show={this.state.show} onChange={this.props.onChange} close={this.close} value={this.props.value} options={this.props.options} />
		}
		return <div hidden={!this.state.show} className= 'pop-modal'>
		<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>
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
		return (<div onClick={this.onClick} style={style}><div style={{width:22, display:'table-cell'}}>{check}</div><div style={{width:170, display:'table-cell'}}>{this.props.value}</div><div style={{width:22, display:'table-cell'}}></div></div>)
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
		this.props.sendPacket(this.props.param[0], parseInt(val));
	
		////console.log(this.props.data)
		this.setState({val:value})
	}
	valChangedl(e){
		
		var val = e.target.value//e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
			//////console.log(val)
			this.props.sendPacket(this.props.param[0], parseInt(val));
		var value = this.state.val;
		value[0] = e.target.value
		////console.log(this.props.data)
		this.setState({val:value})
	}
	valChangedb(e){
		////console.log(e)
		var val = e;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
		var value = this.state.val;
		value[1] = e
		////console.log(this.props.data)
		this.setState({val:value})
	}
	valChangedlb(e){
	//	////console.log(e)
		var val = e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
			this.props.sendPacket(this.props.param[1], parseInt(val));
		var value = this.state.val;
		value[1] = e.target.value
		////console.log(this.props.data)
		this.setState({val:value})
	}
	componentWillReceiveProps (newProps) {
		this.setState({size:newProps.size, val:newProps.data.slice(0)})
	}
	deactivate () {
		// body...
		if(this.refs.ed){
			////console.log(['1511', 'this the prob'])
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
		var style = {display:'inline-block',fontSize:24}
		if(this.state.size == 1){
			style = {display:'inline-block',fontSize:20}
		}else if(this.state.size == 0){
			style = {display:'inline-block',fontSize:16}
		}
		var namestring = this.props.name;
		if(namestring.indexOf('INPUT_')!= -1){
			////console.log(namestring)
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
		////console.log(['1720',this.props.name, this.props.data])
		if(typeof vMapV2[this.props.name] != 'undefined'){
				if(vMapV2[this.props.name]['@translations'][this.props.language]['name'] != ''){
					namestring = vMapV2[this.props.name]['@translations'][this.props.language]['name']
				}
			}
		if(this.props.data.length > 0	){
			if(Array.isArray(this.props.data[0])){
				////console.log('1728')
				return (<NestedEditControl language={this.props.language}  ip={this.props.ip} faultBits={this.props.faultBits} ioBits={this.props.ioBits} acc={this.props.acc} activate={this.props.activate} ref='ed' vst={this.props.vst} 
					lvst={this.props.lvst} param={this.props.param} size={this.props.size} sendPacket={this.props.sendPacket} data={this.props.data} label={this.props.label} int={this.props.int} name={this.props.name}/>)
			}else{
				////console.log('1732')
				return (<MultiEditControl  vMap={vMapV2[this.props.name]} language={this.props.language} ip={this.props.ip} faultBits={this.props.faultBits} ioBits={this.props.ioBits} onFocus={this.onFocus} onRequestClose={this.onRequestClose} acc={this.props.acc} activate={this.props.activate} ref='ed' vst={this.props.vst} 
					lvst={this.props.lvst} param={this.props.param} size={this.props.size} sendPacket={this.props.sendPacket} data={this.props.data} label={this.props.label} int={this.props.int} name={this.props.name}/>)
			}	
		}

		var lvst = {display: 'inline-block',fontSize: 24,width: '310',background: '#5d5480',borderRadius: 20,textAlign: 'center', color: '#eee'}
		
		var dval = this.props.data[0]
		if(this.props.label){
			dval=_pVdef[6][this.props.param[0]["@labels"]]['english'][this.props.data[0]]
		}
		
			var st = this.props.vst;
			st.width = 536
			if(this.state.mode == 0){
				return <div onClick={this.switchMode}><label style={lvst}>{namestring + ": "}</label><label style={st}>{dval}</label></div>
			}else{
				if(this.props.label){
					var selected = this.state.val[0];
					////console.log(selected)
					if (this.props.param[0]["@labels"] == 'InputSrc'){
						console.log(['1795', 'Input Source bits'])
					}else if(this.props.param[0]["@labels"] == 'OutputSrc'){
						console.log(['1797', 'Output Source bits'])
					}
					var options = _pVdef[6][this.props.param[0]["@labels"]]['english'].map(function(e,i){
						if(i==selected){
							return (<option value={i} selected>{e}</option>)
						}else{
							return (<option value={i}>{e}</option>)
						}
					})
				//	var lvst = this.props.lvst
					if((this.props.param[0]['@labels'] == 'FaultMaskBit')){
						if(this.props.faultBits.indexOf(this.props.param[0]['@name'].slice(0,-4)) != -1){
							lvst.color= '#ffa500'
						}
					}
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
					var input = (<CustomKeyboard ref={'keyboard'} onInput={this.valChanged} label={this.state.val[0].toString()} value={this.state.val[0].toString()} num={num} onKeyPress={this._handleKeyPress} onFocus={this.onFocus} onRequestClose={this.onRequestClose} />)//
					
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
	}
	toggle () {
		var self = this;
		if(this.state.keyboardVisible){
			return
		}
		if(!this.state.override){
			if(this.state.show){
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
	updateMeter (a,b) {
		// body...
		if(this.state.show){
			this.refs.mb.update(a,b)
		}
		
	}
	clear (c) {
		// body...
		this.props.clear(c)
	}
	updateSig (a,b) {
		// body...
		if(this.state.show){
				if(typeof b != 'undefined'){
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
				im = <InterceptorMeterBar ref='mb' clear={this.clear}/>
			}
				cont = (<ModalCont toggle={this.toggle} Style={this.props.Style} innerStyle={this.props.innerStyle}>
					{im}
			{this.props.children}
		</ModalCont>)
		}

		return(<div className={this.state.className} hidden={h}>
			<div className='modal-x' onClick={this.toggle}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>
			{cont}
	</div>)
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
		var button = 	<button className='modal-close' onClick={this.toggle}><img className='closeIcon' src='assets/Close-icon.png'/></button>
			
				return (<div className='modal-outer' style={style}>
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
			////console.log(dat)
		}
		this.state =  ({banks:dat})
		this.onRMsg = this.onRMsg.bind(this);
		this.onParamMsg2 = this.onParamMsg2.bind(this);
	}
	onRMsg (e,d) {
		// body...
		if(this.refs[d.ip]){
			////console.log(d)
			this.refs[d.ip].onRMsg(e,d)
	
		}
	}
	onParamMsg2(e,d){
		if(this.refs[d.ip]){
			//////console.log(d)
			this.refs[d.ip].onParamMsg2(e,d)
	
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
			return <StatBarMB unit={b} onSelect={self.switchUnit} ref={b.ip} name={b.name}/>
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
		var interceptor = this.props.unit.interceptor;//(vdefByIp[this.props.unit.ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2)//(this.props.unit.board_id == 5)
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
		myTimers[this.props.unit.ip] = setInterval(function(){
			if((Date.now()-liveTimer[self.props.unit.ip])>1000){
				self.setState({live:false})
			}
			if(!self.state.rpcResp){
				socket.emit('rpc',{ip:self.props.unit.ip, data:packet});	
			}
			
		},1000)
			
	}
	componentWillUnmount () {
		clearInterval(myTimers[this.props.unit.ip]);
	}
	onRMsg (e,d) {
		// body...
		if(d.ip = this.props.unit.ip){
			clearInterval(myTimers[this.props.unit.ip]);
			this.setState({rpcResp:true})	
		}		
		e = null;
		d = null;

	}
	onParamMsg2(e){
		

		var self = this;
   		var res = vdefByIp[this.props.unit.ip]
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
					this.setLEDS(getVal(prodArray,2,'Reject_LED', pVdef),rec['Prod_LED'],rec['Prod_HI_LED'])
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
			////console.log(klass)
		}
		if(!this.state.live){

			klass = 'inactive'
			////console.log(klass)
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
		var interceptor =  this.props.unit.interceptor//(vdefByIp[this.props.unit.ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2)//(this.props.unit.board_id == 5)
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
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		this.refs.lv.update(dat)
	}
	updateMeterInt(a,b){
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		//////console.log([a,b])
		this.refs.lv.update(a,b)	
	}
	onRMsg (e,d) {
		clearInterval(myTimers[this.props.unit.ip]);
		this.setState({rpcResp:true})
	}
	onParamMsg2(e){
		var self = this;
   		var res = vdefByIp[this.props.unit.ip]
		var lcd_type = e.type
		var rec = e.rec
		//console.log(['2767',e])
		if(res){
			var pVdef = res[1]
			if(lcd_type == 1){
				if(!this.state.interceptor){
					this.setProdVars(rec['ProdName'],rec['Sens'],rec['PhaseMode'])
				
					
				}else{
					this.setProdVarsInt(rec['ProdName'],rec['Sens_A'],rec['PhaseMode_A'],rec['Sens_B'],rec['PhaseMode_B'])
					//this.setProdVarsInt(getVal(prodArray, 1, 'ProdName', pVdef),getVal(prodArray, 1, 'Sens_A', pVdef),getVal(prodArray, 1, 'Sens_B', pVdef),getVal(prodArray,1,'PhaseMode_A', pVdef),getVal(prodArray,1,'PhaseMode_B', pVdef))
					
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
		myTimers[this.props.unit.ip] = setInterval(function(){
			if((Date.now() - liveTimer[self.props.unit.ip]) > 1000){
				self.setState({live:false})
			}
			if(!self.state.rpcResp){
				var packet = dsp_rpc_paylod_for(19,[102,0,0])
				socket.emit('rpc',{ip:self.props.unit.ip, data:packet})
			}
		}, 1000)
	}
	componentWillUnmount () {
		clearInterval(myTimers[this.props.unit.ip]);
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
				<tr><td><label>Sensitivity:{this.state.sens_A+ "  "+ this.state.sens_B}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A] 
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
			////console.log(this.props.index)
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
						<label >Name:{this.props.mb.name}</label>
						{editRow}
					</div>)	
		}
}
/*	sendAck  () {
		var packet = dsp_rpc_paylod_for(19,[644,0,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
	}
	testMan () {
		var packet = dsp_rpc_paylod_for(19,[608,0,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
	}
	testMan2 () {
		var packet = dsp_rpc_paylod_for(19,[610,0,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
	}
	testHalo () {
		var packet = dsp_rpc_paylod_for(19,[604,0,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
	}
	testHalo2 () {
		var packet = dsp_rpc_paylod_for(19,[606,0,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
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
		
	}*/
class DetectorView extends React.Component{
	constructor(props) {
		super(props)
		// body...
		console.log(['4070',this.props])
		var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 467px)'),
			window.matchMedia('(min-width: 600px)')
		]
		var minMq = window.matchMedia("(min-width: 400px)");
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		minMq.addListener(this.listenToMq);
		var interceptor = this.props.det.interceptor//(vdefByIp[this.props.det.ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2)//(this.props.det.board_id == 5);
		this.state =  {callback:null, rec:{},	showTest:false, faultArray:[],pind:0,currentView:'MainDisplay', data:[], stack:[], pn:'', sens:0, netpoll:this.props.netpolls, 
			prodSettings:{}, sysSettings:{}, combinedSettings:[],cob2:[], pages:{}, showCal:false,
			minMq:minMq, minW:minMq.matches, br:this.props.br, mqls:mqls, fault:false, 
			peak:0, rej:0, phase:0, interceptor:interceptor, ioBITs:{}, testRec:{}, updateCount:0, language:0,rejOn:0}
		this.sendPacket = this.sendPacket.bind(this);
		this.onRMsg = this.onRMsg.bind(this);
		this.toggleAttention = this.toggleAttention.bind(this);
		this.onNetpoll = this.onNetpoll.bind(this);
		this.listenToMq = this.listenToMq.bind(this);
		this.getCob = this.getCob.bind(this);
		this.getPages = this.getPages.bind(this);
		this.getPage = this.getPage.bind(this);
		this.onParamMsg2 = this.onParamMsg2.bind(this);
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
		this.sendOp = this.sendOp.bind(this);
		this.quitTest = this.quitTest.bind(this);
		this.calClosed = this.calClosed.bind(this);
		
	}
	componentWillReceiveProps (newProps) {
		var packet = dsp_rpc_paylod_for(19,[102,0,0])
		socket.emit('rpc',{ip:newProps.det.ip, data:packet})
		this.setState({netpoll:newProps.netpolls, update:true})
	}

	toggleAttention () {
		this.refs.fModal.toggle();
	}
	onRMsg (e,d) {
		// body...
		//////console.log([e,d])
		if(this.props.det.ip != d.ip){
			return;
		}
		var msg = e.data
		var data = new Uint8Array(msg);
		console.log(['3489',data])
		if(data[1] == 18){
			//prodList

			console.log('prodList')
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
		////console.log(['2600',e])
		var nps = this.state.netpoll
		if(nps.length == 15){
			nps.splice(1,-1);
		}
		nps.unshift(e);
		this.setState({netpoll:nps, update:true})
	}
	listenToMq () {
		this.setState({minW:this.state.minMq.matches, update:true})	
	}
	getCob (sys,prod,dyn) {
		// body...
		var vdef = vdefByIp[this.props.det.ip]
		var _cvdf = JSON.parse(JSON.stringify(vdef[4][0]))
		var cob =  iterateCats(_cvdf, vdef[1],sys,prod, vdef[5],dyn)
		vdef = null;
		_cvdf = null;
		return cob
	}
	getPages (sys,prod,dyn) {
		// body...
		var vdef = vdefByIp[this.props.det.ip]
		var _pages = JSON.parse(JSON.stringify(vdef[6]))
		var pages = {}
		for(var pg in _pages){
			pages[pg] = iterateCats(_pages[pg], vdef[1],sys,prod, vdef[5],dyn)
		}
		vdef = null;
		_pages = null;
		return pages
	}
	getPage (pg,sys,prod,dyn) {
		// body...
		var vdef = vdefByIp[this.props.det.ip]
		var _page = JSON.parse(JSON.stringify(vdef[6][pg]))
		var page = {}
		page = iterateCats(_page, vdef[1],sys,prod, vdef[5],dyn)
	
		vdef = null;
		_page = null;
		return page
	}
	onParamMsg2 (e,d) {
		if(this.props.det.ip != d.ip){
			return;
		}
		var sysSettings =  null;//this.state.sysSettings;
		var prodSettings = null;//this.state.prodSettings;
		var combinedSettings = null;
		var self = this;
   		var lcd_type = e.type;
  	    if(lcd_type== 0){
 			console.log('sys')
			if(vdefByIp[d.ip]){
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
					cob2 = this.getCob(sysSettings, this.state.prodSettings, this.state.rec);
					pages = this.getPages(sysSettings, this.state.prodSettings, this.state.rec);
					//var langs = ['english','french','spanish','portuguese','german','italian','polish','turkish']
					var lang = sysSettings['Language']
					this.setState({sysSettings:sysSettings,cob2:cob2, pages:pages, updateCount:0,update:true,language:lang})
				}
			
    		}  
    		sysSettings = null;
		}else if(lcd_type == 1){
			if(vdefByIp[d.ip]){
				var prodRec = e.rec;
				var cob2;// = iterateCats(_cvdf[0], pVdef, this.state.sysSettings, prodSettings, _vmap, this.state.rec)
    			var pages;// = {}    		
					if(this.refs.sd){
						this.refs.sd.parseInfo(this.state.sysSettings, prodRec)	
					}
					if(this.refs.im){
						this.refs.im.parseInfo(this.state.sysSettings, prodRec)
					}
				if(isDiff(prodRec,this.state.prodSettings)){
					cob2 = this.getCob(this.state.sysSettings, prodRec, this.state.rec)
					pages = this.getPages(this.state.sysSettings, prodRec, this.state.rec)
				
					this.setState({prodSettings:prodRec, cob2:cob2, pages:pages, updateCount:0,update:true})
				}
			}	
		}else if(lcd_type==2){
			if(vdefByIp[d.ip])
			{
					var pVdef = vdefByIp[d.ip][1]
					var rejOn = 0
					var shouldUpdate = false
  					
					var prodRec = e.rec
					if(_ioBits){
    						var iobits = {}
    						_ioBits.forEach(function(b){
    							if(typeof prodRec[b] != 'undefined'){
    								iobits[b] = prodRec[b]
    							}
    						})
    						if(isDiff(iobits,this.state.ioBITs)){
    							this.setState({ioBITs:iobits, update:true})
    						}
    					}
    				if(this.state.interceptor){
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
						var rej = prodRec['RejCount']
						rejOn = prodRec['REJ_MAIN'] ||prodRec['REJ_ALT']
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

						if((this.refs.im.state.peak !=pka)||(this.refs.im.state.rpeak != rpka)||(this.refs.im.state.xpeak != xpka)||(this.refs.im.state.rej != rej)
							||(this.refs.im.state.phase != phaseA)||(this.refs.im.state.peakb !=pkb)||(this.refs.im.state.rpeakb != rpkb)||(this.refs.im.state.xpeakb != xpkb)
							||(this.refs.im.state.phaseb != phaseB)||(this.refs.im.state.phaseFast != phaseSpeedA)||(this.refs.im.state.phaseFastB != phaseSpeedB)||(this.refs.im.state.pled_a !=pled_a)||(this.refs.im.state.pled_b !=pled_b)){
							this.refs.im.setState({peak:pka,peakb:pkb,rpeak:rpka,rpeakb:rpkb,xpeak:xpka,xpeakb:xpkb,rej:rej,phase:phaseA,phaseb:phaseB,phaseFast:phaseSpeedA,phaseFastB:phaseSpeedB, pled_a:pled_a, pled_b:pled_b})		
						}
						if(this.refs.cb){
							if((this.refs.cb.state.rpeak != rpka)||(this.refs.cb.state.xpeak != xpka)||(this.refs.cb.state.phase != phaseA)||(this.refs.cb.state.rpeakb != rpkb)||(this.refs.cb.state.xpeakb != xpkb)
							||(this.refs.cb.state.phaseb != phaseB)||(this.refs.cb.state.phaseSpeed != phaseSpeedA)||(this.refs.cb.state.phaseSpeedB != phaseSpeedB)||(this.refs.cb.state.phaseMode != phaseWet) || (this.refs.cb.state.phaseModeB != phaseWetB)||(this.refs.cb.state.pled_a != pled_a)||(this.refs.cb.state.pled_b != pled_b)){
								this.refs.cb.setState({rpeak:rpka, xpeak:xpka, phase:phaseA, rpeakb:rpkb, xpeakb:xpkb, phaseb:phaseB,phaseSpeed:phaseSpeedA,phaseSpeedB:phaseSpeedB,phaseMode:phaseWet, phaseModeB:phaseWetB, pled_a:pled_a, pled_b: pled_b})
							}
						}
						this.refs.im.update(siga,sigb)
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
						rejOn = prodRec['REJ_MAIN'] ||prodRec['REJ_ALT']
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
					
				  	var faultArray = [];
					pVdef[7].forEach(function(f){
					if(prodRec[f] != 0){
						faultArray.push(f)
						}
					});
					console.log(rejOn)
					
  					if(this.state.faultArray.length != faultArray.length){
  						shouldUpdate = true;
  						//this.setState({faultArray:faultArray, rejOn:rejOn, update:true})
  					}else if(this.state.rejOn != rejOn){
  						shouldUpdate = true
  						//console.log(['4566', rejOn])
  					}else{
  						//var diff = false;
  						faultArray.forEach(function (f) {
  							if(self.state.faultArray.indexOf(f) == -1){
  								shouldUpdate = true;
  							}
  						})
  					}
  						
  					//faultArray = null;	
  					//timings for shouldUpdate? 
  					var siga = uintToInt(prodRec['DetectSignal_A'],16)
  					var sigb = uintToInt(prodRec['DetectSignal_B'],16)

  					this.refs.sModal.updateMeter(siga,sigb)
  					this.refs.sModal.updateSig(prodRec['Peak_A'],prodRec['Peak_B'])
  					this.refs.snModal.updateMeter(siga,sigb)
  					this.refs.snModal.updateSig(prodRec['Peak_A'],prodRec['Peak_B'])
  					this.refs.calibModal.updateMeter(siga,sigb)
  					this.refs.calibModal.updateSig(prodRec['Peak_A'],prodRec['Peak_B'])
  					this.refs.teModal.updateMeter(siga,sigb)
  					this.refs.teModal.updateSig(prodRec['Peak_A'],prodRec['Peak_B'])
  						
  					if(this.state.updateCount ==3){
  						if((this.refs.sModal.state.show && !this.refs.sModal.state.keyboardVisible) || (this.refs.snModal.state.show && !this.refs.snModal.state.keyboardVisible)
  							|| (this.refs.teModal.state.show && !this.refs.teModal.state.keyboardVisible)|| (this.refs.calibModal.state.show && this.state.showCal && !this.refs.calibModal.state.keyboardVisible)){
  								shouldUpdate = true
  						}
  					}
  						

  						if(shouldUpdate){
  							if(this.refs.sModal.state.show){
  								var	cob2 = this.getCob(this.state.sysSettings, this.state.prodSettings, prodRec)
  								this.setState({rec:prodRec,faultArray:faultArray, cob2:cob2, rejOn:rejOn, updateCount:0,update:shouldUpdate})
  								//console.log(['3196',cob2])
  								
  								cob2 = null;
  							}else if(this.refs.snModal.state.show){
  								var	sns = this.getPage('Sens',this.state.sysSettings,this.state.prodSettings, prodRec)
  								var pages = this.state.pages;
  								pages['Sens'] = sns
  								this.setState({rec:prodRec, pages:pages,faultArray:faultArray, rejOn:rejOn,updateCount:0,update:shouldUpdate})
  								sns = null;
  								pages = null;

  							}else if(this.refs.teModal.state.show){
  								var	te = this.getPage('Test',this.state.sysSettings,this.state.prodSettings, prodRec)
  								var pages = this.state.pages;
  								pages['Test'] = te
  								this.setState({rec:prodRec, pages:pages,faultArray:faultArray,rejOn:rejOn, updateCount:0,update:shouldUpdate})
  								te = null;
  								pages = null;
  							}else if(this.state.showCal){
  								//console.log(['3878',prodRec['PhaseAngleAuto_B']])
  								var	cal = this.getPage('Calibration',this.state.sysSettings,this.state.prodSettings, prodRec)
  								var pages = this.state.pages;
  								pages['Calibration'] = cal
  								this.setState({rec:prodRec, pages:pages,faultArray:faultArray, rejOn:rejOn, updateCount:0,update:shouldUpdate})
  								cal = null;
  								pages = null;
  							}else{
  								this.setState({rec:prodRec,faultArray:faultArray, rejOn:rejOn, updateCount:0, update:shouldUpdate})
  							}
  						}else{
  							//console.log(rejOn)
  							this.setState({rec:prodRec, rejOn:rejOn,faultArray:faultArray, updateCount:(this.state.updateCount+1)%6, update:shouldUpdate})
  						}
  						faultArray = null;
  				
			}
			
			pVdef = null;
			iobits = null;

   		}else if(lcd_type == 3){
   					
			var prodRec = e.rec

		}else if(lcd_type == 4){
   				var testRec = e.rec
					
    			if(isDiff(testRec, this.state.testRec)){
    				this.setState({testRec:testRec, update:true})
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
		this.setState({data:[[this.state.cob2,0]], update:true})
		setTimeout(function () {
				self.refs.sModal.toggle()
		}, 100)
	}
	showSens () {
		var self = this;
		this.setState({data:[[this.state.pages['Sens'],0]], stack:[], update:true})

		setTimeout(function () {
			// body...
			self.refs.snModal.toggle()
		}, 100)
	}
	showTestModal () {
		var self = this;
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
			self.refs.teModal.toggle()
		}, 100)
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
		console.log(['3277',param])
		var packet = dsp_rpc_paylod_for(param['@rpcs']['clear'][0],param['@rpcs']['clear'][1],param['@rpcs']['clear'][2] ) 
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		packet = null;
	}	
	sendPacket (n,v) {
		var vdef = vdefByIp[this.props.ip]
		var self = this;
		if(typeof n == 'string'){
			if(n == 'copyCurrentProd'){
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
			////console.log(packet)
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
			////console.log(this.props.ip)
			var packet = dsp_rpc_paylod_for(rpc[0],pkt);
			////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
		}else if(n == 'Sens_B'){
			////console.log(this.props.ip)
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
			////console.log(packet)
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
					////console.log(packet)
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
				strArg = n['@rpcs']['write'][2]
			}
			
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		
		
		}else if(n['@rpcs']['clear']){
			var packet;
			this.clear(n)
		}
		}
			packet = null;
	}

	settingsClosed () {
		// body...
			var st = [];
			var currentView = 'MainDisplay';
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
		var packet= dsp_rpc_paylod_for(19,[36,0,0],[a])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		
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
		
		
		if(this.state.testRec['TestRecOnFlag']){
			if(this.state.testRec['TestRecPage'] == 3){
				//send operator code
				testcont = <div>Test required. Enter operator code
						<div><button onClick={this.sendOp}>Send OP</button></div>
					</div>

			}else if(this.state.testRec['TestRecPage'] == 2){
				//prompt
					testcont = <div>
					<div>Select Test</div>
					<table>
						<tbody><tr>
							<td style={nograd} onClick={this.testMan}>Manual</td><td style={nograd} onClick={this.testHalo}>Halo</td>
						</tr><tr>
							<td style={nograd} onClick={this.testMan2}>Manual 2</td><td style={nograd} onClick={this.testHalo2}>Halo 2</td> 
						</tr></tbody>
					</table>
				</div>

			}else{
				var cn = this.state.testRec['TestRecConfig']
				var mode = testModes[this.state.testRec['TestRecConfig']]
				var testcount = 3
				var cfs = []
				if(this.props.det.interceptor){
					testcount = 6
				}
				for(var i = 0; i<testcount;i++){
					var cnt = this.state.prodSettings['TestConfigCount'+cn+'_'+i]//config[i]['@children'][1];
					var met = metTypes[this.state.prodSettings['TestConfigMetal'+cn+'_'+i]]
					var sigchain = ''

					if(this.props.det.interceptor){
						sigchain = <div style={{display:'inline-block', width:30}}>{schain[this.state.prodSettings['TestConfigFreq'+cn+'_'+i]]}</div>
					}
					var lab = ''
					if(i == this.state.testRec['TestRecOrder']){

						if((this.state.testRec['TestRecAckMetalFlag'])&&(this.state.testRec['TestRecPassCnt'] == 0))
						{
							ack = <button onClick={this.sendAck}>Acknowledge Test</button>
						}else{
							ack = 'Currently Running'
						}
						lab = <div style={{background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))'}}><div style={{display:'inline-block', width:60}}>{cnt - this.state.testRec['TestRecPassCnt']} of {cnt}
						</div><div style={{display:'inline-block', width:170}}>{met}</div>{sigchain}<div style={{display:'inline-block', width:250}}>{ack}</div></div>
					}else if(i<this.state.testRec['TestRecOrder']){
						lab = <div style={{background:'linear-gradient(315deg, transparent 33%, rgba(0,128,128,0.4))'}}><div style={{display:'inline-block', width:60}}>{cnt} of {cnt}
						</div><div style={{display:'inline-block', width:170}}>{met}</div>{sigchain}<div style={{display:'inline-block', width:250}}>Done</div></div>
					
					}else if(cnt != 0){
						lab = <div style={{background:'linear-gradient(315deg, transparent 33%, rgba(128,128,128,0.4))'}}><div style={{display:'inline-block', width:60}}>0 of {cnt}
						</div><div style={{display:'inline-block', width:170}}>{met}</div>{sigchain}<div style={{display:'inline-block', width:250}}></div></div>
					
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

		var testprompt = (<div style={{color:'#e1e1e1'}} >{testcont}
			
		<div><button onClick={this.quitTest}>Quit Test</button></div>

		 </div>)
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
	toggleTestSettings () {
		if(this.state.showTest){
			this.setState({showTest:false, data:[], stack:[], update:true})
		}else{
			this.setState({showTest:true, data:[[this.state.pages['Test'],0]], stack:[], update:true})
		}
	}
	toggleCalSettings () {
		if(this.state.showCal){
			this.setState({showCal:false, data:[], stack:[], update:true})
		}else{
			this.setState({showCal:true, data:[[this.state.pages['Calibration'],0]], stack:[], update:true})
		}
	}
	getProdName (n, cb,i) {
		var self = this;
		this.setState({callback:cb, pind:i})
		setTimeout(function () {
			self.sendPacket('getProdName',n)
		},50)
	}
	clearFaults () {
		this.sendPacket('clearFaults',0)
	}
	calClosed () {
		this.setState({showCal:false, update:true})
	}
	showCalibModal () {
		var self = this;
		this.setState({showCal:false, update:true})
		setTimeout(function (argument) {
			self.refs.calibModal.toggle();
		
		},100)
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
	setLanguage (i) {
		var langs = ['english', 'korean']
		this.setState({language:i, update:true})
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
	//	console.log(lg)
		var MD ="";
		var dm = "";// <DetMainInfo clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} ref='dm' int={this.state.interceptor}/>
		var dg = "";// <DummyGraph ref='dg' canvasId={'dummyCanvas'} int={this.state.interceptor}/>
		var ce =""// <ConcreteElem h={400} w={400} concreteId={'concreteCanvas'} int={this.state.interceptor}/>
	 	var lstyle = {height: 72,marginRight: 20, marginLeft:10}
	 	var np = (<NetPollView ref='np' eventCount={15} events={this.state.netpoll}/>)
		if(!this.state.minW){
			lstyle = { height: 60, marginRight: 15, marginLeft: 10}
		}
		var SD = (<SettingsDisplay2 Id={this.props.ip+'SD'} language={lg} mode={'config'} setOverride={this.setOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'sd' data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.cob2]} cvdf={vdefByIp[this.props.det.ip][4]} sendPacket={this.sendPacket} prodSettings={this.state.prodSettings} sysSettings={this.state.sysSettings} dynSettings={this.state.rec}/>)
		MD = ""; 
		var snsCont = <SettingsDisplay2 Id={this.props.ip+'SNSD'} language={lg} setOverride={this.setSOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'snspage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.pages['Sens']]} cvdf={vdefByIp[this.props.det.ip][6]['Sens']} sendPacket={this.sendPacket} prodSettings={this.state.prodSettings} sysSettings={this.state.sysSettings} dynSettings={this.state.rec}/>
		var mpui = 	<StealthMainPageUI  language={this.state.language} setLang={this.setLanguage}toggleCalib={this.showCalibModal} toggleTestModal={this.showTestModal} toggleSens={this.showSens} toggleConfig={this.showSettings} netpoll={this.state.netpoll} clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} gohome={this.logoClick} ref='im' getProdName={this.getProdName}/>
		var cb = <StealthCalibrateUI  language={lg} ref='cb' onFocus={this.onCalFocus} onRequestClose={this.onCalClose} sendPacket={this.sendPacket} refresh={this.refresh} calib={this.cal} />
	
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
		var ov = 0
		if(this.state.testRec['TestRecOnFlag']){
			ov = 1;
		}
		var tescont = <TestReq ip={this.props.ip} toggle={this.showTestModal} settings={this.state.prodSettings}/>
		//var showPropmt = "Settings";
		var showPrompt = "#e1e1e1";
		var showPropmt = "#e1e1e1";
		var tbklass = 'expandButton';
		if (this.state.showTest){
			var dt;
			if(this.state.data.length == 0){
				dt = []
			}
			tescont = 	<SettingsDisplay2 Id={this.props.ip+'TESTD'} language={lg} setOverride={this.setTOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'testpage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.pages['Test']]} cvdf={vdefByIp[this.props.det.ip][6]['Test']} sendPacket={this.sendPacket} prodSettings={this.state.prodSettings} sysSettings={this.state.sysSettings} dynSettings={this.state.rec}/>
			showPropmt = "orange"
			tbklass='collapseButton'
		}
				
			if(this.props.det.interceptor){
				mpui = 	<InterceptorMainPageUI rejOn={this.state.rejOn} language={this.state.language} setLang={this.setLanguage} toggleCalib={this.showCalibModal} toggleTestModal={this.showTestModal}
				faultArray={this.state.faultArray} clearFaults={this.clearFaults} toggleSens={this.showSens} toggleConfig={this.showSettings} netpoll={this.state.netpoll} clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} gohome={this.logoClick} ref='im' getProdName={this.getProdName}/>
				cb = <div>
				<div style={{paddingTop:10, paddingBottom:4}}>
					 <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5, fontWeight:500, color:"#eee"}} ><div style={{display:'inline-block', textAlign:'center'}}>Calibration</div></h2></span></div>
				<InterceptorCalibrateUI language={lg} ref='cb' onFocus={this.onCalFocus} onRequestClose={this.onCalClose} sendPacket={this.sendPacket} refresh={this.refresh} calibA={this.calA} calibB={this.calB} /></div>
				
			}
		var testprompt = this.renderTest();
		var CB;
		if(this.state.showCal){
			CB = <SettingsDisplay2 Id={this.props.ip+'CALBD'} language={lg} setOverride={this.setCOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'calpage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.pages['Calibration']]} cvdf={vdefByIp[this.props.det.ip][6]['Calibration']} sendPacket={this.sendPacket} prodSettings={this.state.prodSettings} sysSettings={this.state.sysSettings} dynSettings={this.state.rec}/>
			showPrompt = "orange"
		}else{
			CB = cb
		}
		var tocal = <svg style={{position:'absolute',left: 840, marginTop:2}} onClick={this.toggleCalSettings} xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPrompt}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
					

		var totest = <svg style={{position:'absolute',left: 840, marginTop:5}} onClick={this.toggleTestSettings} xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPropmt}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
					

		return(<div>
			<div hidden>
				{lmtable}

			</div>

			{mpui}	
			<Modal ref ='calibModal' onClose={this.calClosed} intMeter={true} clear={this.clearSig}>
					{tocal}
				<div>
			
				{CB}
				</div>	
			</Modal>
			<Modal ref='sModal' onClose={this.settingsClosed} intMeter={true} clear={this.clearSig}>
					{SD}
				</Modal>
					<Modal ref='fModal'>
					<FaultDiv maskFault={this.maskFault} clearFaults={this.clearFaults} faults={this.state.faultArray}/>
				</Modal>
				<Modal ref='tModal' override={ov} intMeter={true} clear={this.clearSig}>
					{testprompt}
				
				</Modal>
				<Modal ref='teModal' intMeter={true} clear={this.clearSig}>
				{totest}	
				{tescont}
				</Modal>
				<Modal ref='snModal' intMeter={true} clear={this.clearSig}>
					{snsCont}
				</Modal>
				</div>)
	} 
}

class Storage extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({cob:{},pages:{},faultArray:[],ioBITs:[]})
	}
	parseRec () {
		// body...
	}
	showSettings () {
		this.refs.sModal.toggle();
		this.setState({data:[[this.state.cob2,0]], update:true})
	}
	showSens () {
		this.refs.snModal.toggle()
		this.setState({data:[[this.state.pages['Sens'],0]], stack:[], update:true})
	}
	setOverride (ov) {
		this.refs.sModal.setState({keyboardVisible:ov})
	}
	setTOverride (ov) {
		this.refs.teModal.setState({keyboardVisible:ov})
	}
	setSOverride (ov) {
		this.refs.snModal.setState({keyboardVisible:ov})
	}
	sendPacket (n,v) {
		this.props.sendPacket(n,v)
	}
	render () {
		var ov = 0
		if(this.state.testRec['TestRecOnFlag']){
			ov = 1;
		}
		var tescont = <TestReq ip={this.props.ip} toggle={this.showTestModal} settings={this.state.pages['Test']}/>
		var showPropmt = "Settings";
		var tbklass = 'expandButton';
		if (this.state.showTest){
			var dt;
			if(this.state.data.length == 0){
				dt = []
			}
			tescont = 	<SettingsDisplay2 setOverride={this.setTOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'testpage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.pages['Test']]} cvdf={vdefByIp[this.props.det.ip][6]['Test']} sendPacket={this.sendPacket}/>
			showPropmt = "Back"
			tbklass='collapseButton'
		}
		var snsCont = <SettingsDisplay2 setOverride={this.setSOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'snspage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.pages['Sens']]} cvdf={vdefByIp[this.props.det.ip][6]['Sens']} sendPacket={this.sendPacket}/>

		var	SD = (<SettingsDisplay2 mode={'config'} setOverride={this.setOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'sd' 
				data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.props.interceptor} cob2={[this.state.cob2]} cvdf={vdefByIp[this.props.det.ip][4]} sendPacket={this.sendPacket}/>)
	
		return <div>
			<Modal ref='sModal'>
				{SD}
			</Modal>

			<Modal ref='fModal'></Modal>

			<Modal ref='tModal'>
				{tescont}
			</Modal>


			<Modal ref='snModal'>
				{snsCont}
			</Modal>
		</div>
	}
}

class NetPollView extends React.Component{
	constructor(props) {
		super(props)
		this.state =({events:[]})
		this.pushEvent = this.pushEvent.bind(this);
		this.onNetpoll = this.onNetpoll.bind(this);
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
		////console.log(['3280',e])
		events.unshift(e);
		this.setState({events:events})
	}
	dummyEvent () {
	}
	render () {
		var self = this;
		var events = this.props.events.map(function(e){
			var ev = e.net_poll_h;
			if(netMap[e.net_poll_h]){
				ev = netMap[e.net_poll_h]['@translations']['english']	
			}
			var dateTime = e.date_time.year + '/' + e.date_time.month + '/' + e.date_time.day + ' ' + e.date_time.hours+ ':' + e.date_time.min + ':' + e.date_time.sec;
			var rejects = e.rejects
			var faults = e.faults
			var string = ""
			console.log(['4163',e])
			if(e.net_poll_h == "NET_POLL_REJECT_ID"){

				string = 'rejects:' + rejects.number + ', signal:' + rejects.signal;

			}else if((e.net_poll_h == 'NET_POLL_PROD_REC_VAR')||(e.net_poll_h == 'NET_POLL_PROD_SYS_VAR')){
				if(e.parameters[0].value != null){


					string = e.parameters[0].param_name + ': ' + e.parameters[0].value
				}else if(e.parameters[0].label.type != null){
					string = e.parameters[0].param_name + ': ' + vdefByIp[self.props.ip][0]['@labels'][e.parameters[0].label.type]['english'][e.parameters[0].label.value];
				}
			}else if(e.net_poll_h == 'NET_POLL_FAULT'){
				if(e.faults.length != 0){
					e.faults.forEach(function(f, i){
						string += vdefByIp[self.props.ip][0]['@labels'].FaultSrc['english'][f]
						if(i + 1 <e.faults.length ){
							string += ", "
						}
					})
				}else{
					string = 'No Faults'
				}
				
				//vdefByIp[this.props.ip][0]['@labels'].FaultSrc[]
			}


			return (<tr><td style={{width:150}}>{dateTime}</td><td style={{width:150}}>{ev}</td><td style={{width:220}}>{string}</td></tr>)
		})
		// body...
		return (<div style={{color:'#e1e1e1'}}>
			<label style={{display: 'inline-block',fontSize:26,width:100,float:'left',paddingLeft: 20}}>Events</label>
			<div style={{display:'inline-block', height:260,width:600}}>
			<table className='npTable'>
			<thead><tr><th style={{width:150}}>Timestamp</th><th style={{width:150}}>Event</th><th style={{width:220}}>Details</th></tr>
		</thead>
			<tbody>
				{events}
			</tbody></table>
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
		this.onRequestClose = this.onRequestClose.bind(this);
	}
	componentWillReceiveProps (newProps) {
		this.setState({name:newProps.name})
	}
	switchProd () {
		this.props.switchProd(this.props.p)
	}
	copyProd () {
		this.props.copy();
	}
	deleteProd () {
		this.props.delete(this.props.p)
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
	render () {
		// body...
		var check= ""
		var ds = {paddingLeft:7, display:'inline-block', width:250, background:"#d1d1d1"}
		var st = {padding:7,display:'inline-block', width:200}
		var buttons = <button className='deleteButton' onClick={this.deleteProd}></button>
		if(this.props.selected){
			check = <img src="assets/Check_mark.svg"/>
			ds = {paddingLeft:7,display:'inline-block', width:250,	 background:"#bbb"}
			//st = {color:'green', padding:7, display:'inline-block', width:200}
			buttons = <div style={{display:'inline-block'}}><button className='copyButton' onClick={this.copyProd}></button>
			<button className='editButton' onClick={this.editName}></button>
			<CustomKeyboard onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='nameinput' onChange={this.onChange} value={this.state.name} label={this.state.name}/>
			</div>
		}
		var name = 'Product '+this.props.p
		if(this.props.name.length > 0){
			name = this.props.name
		}
		var editRow ="";
		if(this.props.editMode){
			editRow = <div style={{display:'inline-block', marginLeft:10}}>{buttons}</div>
		}
		return (<div style={{background:"#362c66", color:"#000"}}><div style={ds} ><div style={{display:'inline-block', width:22}}>{check}</div><label onClick={this.switchProd} style={st}>{this.props.p + '.  ' +name}</label></div>{editRow}</div>)
	}
}


class TestReq extends React.Component{
	constructor(props) {
		super(props)
		this.testMan = this.testMan.bind(this);
		this.testMan2 = this.testMan2.bind(this);
		this.testHalo = this.testHalo.bind(this);
		this.testHalo2 = this.testHalo2.bind(this);
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
	render () {
		var testcont = ''
		var ack = ''
		var tdstyle = {background:'rgba(128, 128, 128, 0.3)', fontSize:25, width:170}

		var tdstyleintA = { background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))'}
		var testModes = ['Manual','Halo','Manual 2', 'Halo 2']
		var _tcats = ['Manual','Halo','Manual2','Halo2']
		var metTypes = ['Ferrous','Non-Ferrous','Stainless Steel']
		var schain = ['B','A']
			
		
		
		testcont = <div  style={{color:'#e1e1e1'}}	>
					<div>Select Test</div>
					<table>
						<tbody><tr>
							<td style={tdstyle} onClick={this.testMan}>Manual</td><td style={tdstyle} onClick={this.testHalo}>Halo</td>
						</tr><tr>
							<td style={tdstyle} onClick={this.testMan2}>Manual 2</td><td style={tdstyle} onClick={this.testHalo2}>Halo 2</td> 
						</tr></tbody>
					</table>
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
		return(<CanvasElem canvasId={this.props.canvasId} ref='cv' w={this.state.width} h={this.state.height} int={this.props.int}/>)
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
		var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 444px)'),
			window.matchMedia('(min-width: 600px)'),
			window.matchMedia('(min-width: 850px)')
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		this.state = ({width:480, height:215, mqls:mqls})
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
		this.listenToMq()
	}
	renderCanv () {
		return(<CanvasElem canvasId={this.props.canvasId} ref='cv' w={this.state.width} h={this.state.height} int={this.props.int}/>)
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
class StealthMainPageUI extends React.Component{
	constructor(props) {
		super(props)
		// body...
		var res = vdefByIp[this.props.det.ip]
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
			console.log(['5369', pack])
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
		console.log(['5888',str])
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
		
		var ps = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed']]
		if(this.state.phaseFast == 1){
			ps = 'fast'
		}
			var peditCont = (<div>
				<div><button style={{float:'right'}} className='editButton' onClick={this.changeProdEditMode}>Edit Products</button></div>
				<div style={{display:'inline-block', width:600, maxHeight:400, overflowY:'scroll'}}>{prodList}</div><div style={{float:'right'}}></div>
			</div>)
		return(<div className='stealthMainPageUI' style={style}>
			<table className='landingMenuTable' style={{marginBottom:-8, marginTop:-7}}>
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
					<TestReq ip={this.props.det.ip} toggle={this.toggleTestModal}/>
				</Modal>
				<Modal ref='pedit'>
				{peditCont}
				</Modal>
				<Modal ref='netpolls'>
					<NetPollView ref='np' eventCount={15} events={this.props.netpoll} ip={this.props.det.ip}/>
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
						
						<div style={{display:'block', height:34, width:470}}>Product Info</div>
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
				<CircularButton lab={'Calibrate'} inverted={true} onClick={this.onCal}/>
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

class InterceptorMainPageUI extends React.Component{
	constructor(props) {
		super(props)
			var res = vdefByIp[this.props.det.ip]
		var pVdef = _pVdef;
		if(res){
			pVdef = res[1];
		} 
		var tmpA = '';
		var tmpB = '';
		var res = null;

		this.state = ({peditMode:false,lang:0,rpeak:0,rpeakb:0,xpeakb:0,xpeak:0, peak:0,peakb:0,phase:0, phaseb:0,rej:0,curInd:0, sysRec:{},prodRec:{}, tmp:'', tmpB:'', prodList:[],prodNames:[], phaseFast:0, phaseFastB:0, pVdef:pVdef, keyboardVisible:false,pled_a:0,pled_b:0})
		this.keyboardOpen = this.keyboardOpen.bind(this);
		this.keyboardClose = this.keyboardClose.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onButton = this.onButton.bind(this);
		this.clearRej = this.clearRej.bind(this);
		this.switchProd = this.switchProd.bind(this);
		this.clearPeak = this.clearPeak.bind(this);
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
	}
	shouldComponentUpdate (nextProps, nextState) {
		if(this.state.keyboardVisible){
			return false;
		}else{
			return true;
		}
	}
	sendPacket (n,v) {
		this.props.sendPacket(n,v);
	}
	update(siga, sigb) {
		var dat = {t:Date.now(),val:siga,valb:sigb}
		this.refs.nv.streamTo(dat)
		this.refs.dv.update(siga,sigb)
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
	switchProd (p) {
		this.props.sendPacket('ProdNo',p)
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
		if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){
			if(this.props.int){
				this.setState({sysRec:sys, prodRec:prd, tmp:prd['Sens_A'], tmpB:prd['Sens_B']})
			}else{
				this.setState({sysRec:sys, prodRec:prd, tmp:prd['Sens']})
			}
			
		}
	}
	showEditor () {
		var self = this;
		this.refs.pedit.toggle()
		setTimeout(function () {
			self.setState({peditMode:false})
			socket.emit('getProdList', self.props.det.ip)
		},100)
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
		console.log(f)
		var self = this;
		if(f == 'test'){
			setTimeout(function () {
				// body...
				self.props.toggleTestModal();
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
		}else if(f=='rej'){
			this.clearRej();
		}else if(f=='sens'){
			setTimeout(function () {
			
				self.props.toggleSens();
			},100)
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
	render () {
		// body...
		var home = 'home'
		var style = {background:'#362c66', width:'100%',display:'block', height:'-webkit-fill-available'}
		var lstyle = {height: 50,marginRight: 20, marginLeft:10}
		var self = this;
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']// ['english','korean']
		var lg = lgs[this.props.language]
		var prodNames = this.state.prodNames
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
		var ps = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed_A']]
			var psb = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed_B']]
			if(this.state.phaseFast == 1){
				ps = 'fast'
			}
			if(this.state.phaseFastB == 1){
				psb = 'fast'
			}
			//					<PopoutSelect val={this.props.language} index={0} onChange={this.languageChange} options={['english','korean']} />
			
		var peditCont = (<div>
				<div style={{color:'#f1f1f1', fontSize:35, textAlign:'center'}}>Products
				<button style={{float:'right',color:"#f1f1f1", fontSize:20}} className='editButton' onClick={this.changeProdEditMode} >Edit</button>
				</div>
				<div></div>
				<div style={{display:'inline-block', width:600, maxHeight:400, overflowY:'scroll'}}>{prodList}</div><div style={{float:'right'}}></div>
			</div>)
		return (<div className='interceptorMainPageUI' style={style}>
					<table className='landingMenuTable' style={{marginBottom:-8, marginTop:-7}}>
						<tbody>
							<tr>
								<td><img style={lstyle}  src='assets/Interceptor-white-01.svg'/></td>
								<td >
					</td><td className="buttCell" style={{height:60}}><button onClick={this.gohome} className={home}/></td>
							</tr>
						</tbody>
					</table>
			<InterceptorDynamicViewV2 language={lg} onButton={this.onButton} onSens={this.onSens} rejOn={this.props.rejOn} faultArray={this.props.faultArray} ref='dv' sens={[this.state.prodRec['Sens_A'],this.state.prodRec['Sens_B']]} sig={[this.state.peak,this.state.peakb]} pleds={[this.state.pled_a,this.state.pled_b]} rej={this.state.rej} onKeyboardOpen={this.keyboardOpen} onKeyboardClose={this.keyboardClose}/>
			<InterceptorNav language={lg} onButton={this.onButton} ref='nv' clearFaults={this.props.clearFaults} rejOn={this.props.rejOn}  faultArray={this.props.faultArray} prodName={this.state.prodRec['ProdName']} />
				<Modal ref='testModal'>
					<TestReq ip={this.props.det.ip} toggle={this.toggleTestModal}/>
				</Modal>
				<Modal ref='pedit' Style={{width:450, background:"#362c66"}} innerStyle={{background:'transparent', boxShadow:'none'}}>
				{peditCont}
				</Modal>
				
				<Modal ref='netpolls'>
					<NetPollView language={lg} ref='np' eventCount={15} events={this.props.netpoll} ip={this.props.det.ip}/>
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
	}
	onConfig () {
		this.props.onButton('config')
	}
	onTest () {
		// body...
		this.props.onButton('test')
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
	streamTo (dat) {
		// body...
		this.refs.sg.stream(dat);
		//console.log('streaming')
	}
	render () {
		// body...
		var labels = {'Settings':{'english':'Settings','korean':'설정'},
		'Test':{'english':'Test','korean':'테스트'},
		'Log':{'english':'Log','korean':'기록'},
		'Sensitivity':{'english':'Sensitivity','korean':'민감도'},
		'Calibrate':{'english':'Calibrate','korean':'캘리브레이션'},
		'Product':{'english':'Product','korean':'품목'} }
		var left =  {width:205, marginLeft:0, marginRight:'auto'}
		var right =  {width:205, marginLeft:'auto', marginRight:0}
		var klass = 'navWrapper'
		if(this.props.faultArray.length != 0){
			klass = 'navWrapper_f'
		}else if(this.props.rejOn == 1){
			klass = 'navWrapper_r'
		}
	//	console.log([vdefMapV2['@labels']['Settings'],this.props.language])
		return (<div className='interceptorNav' style={{display:'block', width:950, marginLeft:'auto',marginRight:'auto', background:'black'}}>
				
				<div className={klass} style={{overflow:'hidden',width:950,height:250}}>
				<table className='intNavTable' style={{height:240, borderSpacing:0, borderCollapse:'collapse'}}><tbody><tr>
				<td>
				<div className='slantedRight'>
					<div style={{background:'#362c66', borderTopRightRadius:'30px 40px', height:240, textAlign:'center'}}>
					<CircularButton style={left} lab={vdefMapV2['@labels']['Settings'][this.props.language]['name']} onClick={this.onConfig}/>
					<CircularButton style={left} lab={vdefMapV2['@labels']['Test'][this.props.language]['name']} onClick={this.onTest}/>
					<CircularButton style={left} lab={vdefMapV2['@labels']['Log'][this.props.language]['name']} onClick={this.onLog}/>
					</div>
				</div>
				</td><td>
				<div style={{display:'inline-block', width:480, height:220, borderBottom:'20px solid #818a90',position:'relative', borderBottomLeftRadius:'100px 402px', borderBottomRightRadius:'100px 402px'}}>
						
				
				<InterceptorNavContent rejOn={this.props.rejOn} language={this.props.language} ref='nv' clearFaults={this.props.clearFaults} faultArray={this.props.faultArray} prodName={this.props.prodName}><SlimGraph int={true} ref='sg' canvasId={'sgcanvas2'}/>	</InterceptorNavContent>
				</div></td><td>
				<div className='slantedLeft'><div style={{background:'#362c66', borderTopLeftRadius:'30px 40px', height:240, textAlign:'center'}}>
				<CircularButton style={right} lab={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} inverted={true} onClick={this.onSens}/>
				<CircularButton style={right} lab={vdefMapV2['@labels']['Calibrate'][this.props.language]['name']} inverted={true} onClick={this.onCal}/>
				<CircularButton style={right} lab={vdefMapV2['@labels']['Product'][this.props.language]['name']} inverted={true} onClick={this.onProd}/>
				</div>	</div></td></tr></tbody></table></div>
			</div>)
	}
}
class InterceptorNavContent extends React.Component{
	constructor(props) {
		super(props)
		this.state =  {prodName:'PRODUCT 1'}
		this.clearFaults = this.clearFaults.bind(this);
		this.onClick = this.onClick.bind(this);
	}
	stream (dat) {
	}
	clearFaults(){
		this.props.clearFaults()
	}
	onClick () {
		if(this.props.faultArray.length>0){
			this.refs.fModal.toggle();
		}
	}
	render () {
		var fActive = (this.props.faultArray.length > 0)
		var left = 'navTabLeft'
		var center = 'navTabCent'
		var right = 'navTabRight'
		var fCont = <div style={{color:"#e1e1e1"}}>No Faults</div>
		var bgColor = 'rgba(150,150,150,0.3)'
		var style = {width:345,height:220,background:'rgb(225,225,225)',marginLeft:'auto',marginRight:'auto'}
		var wrapper = {width:480, height:220}
		var line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Running Product'][this.props.language]['name']}</div>
		var line2 = 	<div style={{display:'block', height:34, width:330, fontSize:25}}>{this.props.prodName}</div>
		if(fActive){
			var fstr = this.props.faultArray.length + " faults active"
			if(this.props.faultArray.length == 1){
				fstr = this.props.faultArray[0] + " active"
			}
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{fstr}</div>
			line2 = 	<div style={{display:'block', height:34, width:330, fontSize:25}}><button hidden onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button></div>
			bgColor = 'yellow'
			left = 'navTabLeft_f'
			center = 'navTabCent_f'
			right = 'navTabRight_f'
			fCont = <div style={{color:"#e1e1e1"}}>{this.props.faultArray.map(function (f) {
				return <div>{f}</div>
			})}<button onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button></div>
		}else if(this.props.rejOn == 1){
			left = 'navTabLeft_r'
			center = 'navTabCent_r'
			right = 'navTabRight_r'
		}
		return (<div className='interceptorNavContent' style={wrapper}>
			<div style={{   position: 'fixed',marginTop: 0,marginLeft: 35, color:'#eee'}}>
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
		this.update = this.update.bind(this)
		this.onSens = this.onSens.bind(this)
		this.onSensB = this.onSensB.bind(this);
		this.onSigA = this.onSigA.bind(this);
		this.onSigB = this.onSigB.bind(this);
		this.onRej = this.onRej.bind(this);
	}
	update (siga, sigb) {
		this.refs.tba.update(siga)
		this.refs.tbb.update(sigb)
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
	render () {
		var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'start'}

		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		var klass = 'interceptorDynamicView'
		var bcolor = 'black';
		var pled = ['#e1e1e1', '#6eed6e', '#ee0000']
		if(this.props.faultArray.length >0){
			klass = 'interceptorDynamicView_f'
			//bcolor = 'red'
		}else if(this.props.rejOn == 1){
			//bcolor = ''
			klass = 'interceptorDynamicView_r'
		}
	
		return (
			<div style={{marginTop:2}}>
			<div className={klass} style={{overflow:'hidden', display:'block', width:956, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:20,boxShadow:'0px 0px 0px 12px #818a90'}}>
				<table  style={{borderSpacing:0,background:'linear-gradient(55deg,#818a90, #818a90 49.9%, #362c66 50.1%, #362c66)'}}><tbody>
				<tr><td style={{display:'inline-block', padding:0,width:336,overflow:'hidden'}}><div style={{width:356,height:36}}></div></td>
				<td colSpan={2} style={{padding:0,display:'inline-block',overflow:'hidden', width:620}}>
				<div style={{padding:10, display:'block', width:516,marginLeft:70,paddingLeft:20}}><TickerBox ref='tbb'/>
				</div></td></tr>
				
				<tr>
				<td style={{padding:0, height:160, overflow:'hidden',display:'inline-block'}}>
				<div  style={{display:'inline-block', width:330, height:160}}>
					<div style={{position:'relative', marginTop:0, marginBottom:-7}}>
					<KeyboardInputTextButton label={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} lab2={' A'} num={true} isEditable={true} value={this.props.sens[0]} onInput={this.onSens} onFocus={this.props.onKeyboardOpen} onRequestClose={this.props.onKeyboardClose} inverted={false}/></div>
				
					<div style={{position:'relative',marginBottom:7}}><KeyboardInputTextButton overrideBG={true} rstyle={{backgroundColor:pled[this.props.pleds[0]]}} bgColor={'rgba(200,200,200,1)'} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={' A'} onClick={this.onSigA} isEditable={false} value={this.props.sig[0]} inverted={false}/></div>
					
				</div>
				</td>
				<td style={{padding:0, height:160, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:280, height:160}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:48}}><div><KeyboardInputTextButton label={vdefMapV2['@labels']['Rejects'][this.props.language]['name']} isEditable={false} onClick={this.onRej} value={this.props.rej} inverted={false}/></div>
				</div>

				</div>
				</td>
				<td style={{padding:0, height:160, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:330, height:160}}>
					<div style={{position:'relative', marginTop:0, marginBottom:-7}}><KeyboardInputTextButton label={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} lab2={' B'} onFocus={this.props.onKeyboardOpen} onRequestClose={this.props.onKeyboardClose} num={true} isEditable={true} value={this.props.sens[1]} onInput={this.onSensB} inverted={true}/></div>
					<div style={{position:'relative',marginBottom:7}}><KeyboardInputTextButton overrideBG={true} bgColor={'rgba(200,200,200,1)'} rstyle={{backgroundColor:pled[this.props.pleds[1]]}} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={' B'} onClick={this.onSigB} isEditable={false} value={this.props.sig[1]} inverted={true}/></div>
					
				</div>
				</td>
				</tr>
				<tr><td colSpan={2} style={{padding:0,display:'inline-block',overflow:'hidden', width:620}}><div style={{padding:10, display:'block', width:516,marginLeft:-7,paddingLeft:20}}><TickerBox ref='tba'/></div></td><td style={{display:'inline-block', padding:0,width:336,overflow:'hidden'}}><div style={{width:356,height:36}}></div></td></tr>
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
		this.props.onClick();
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
		var bstyle = this.props.style || {} //{width:191,border:border,position:'relative',marginTop:8,height:50,overflow:'hidden', borderRadius:32, background:gr, padding:3, marginLeft:mr, marginRight:ml}
	
		if(this.props.inverted){
			return(<div  className='circularButton' onClick={this.onClick} style={bstyle}>
				<div style={{display:'inline-block', position:'relative',top:-2,width:180, color:"#e1e1e1", fontSize:30}}>{this.props.lab}</div>
			</div>)
		}else{
			return(<div className='circularButton' onClick={this.onClick} style={bstyle}>
				<div style={{display:'inline-block', position:'relative',top:-2,width:180, color:"#e1e1e1", fontSize:30}}>{this.props.lab}</div>
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

		//var kb = <KeyboardInput onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} Style={{fontSize:25, textAlign:'center', width:100}} onInput={this.onInput} ref='input' value={this.props.value}/>
		var ckb = <CustomKeyboard ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.value}/>
		//var kb = <KeyboardInput onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} Style={{fontSize:25, textAlign:'center', width:75}} onInput={this.onInput} ref='input' value={this.props.value}/>
		
			kb = <label style={{fontSize:25, textAlign:'center', width:100, display:'inline-block', lineHeight:2}} onClick={this.editValue}>{this.props.value}</label>
		
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

class InterceptorCalibrateUI extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({rpeak:0,xpeak:0,phaseb:0,phaseSpeedB:0, phaseModeB:0, phaseSpeed:0,phase:0,phaseMode:0, tmpStr:'', tmpStrB:'', pled_a:0, pled_b:0})
		this.onCalA = this.onCalA.bind(this);
		this.onCalB = this.onCalB.bind(this);
		this.calibrateAll = this.calibrateAll.bind(this);
		this.onPhaseA = this.onPhaseA.bind(this);
		this.onPhaseB = this.onPhaseB.bind(this);
		this.onModeA = this.onModeA.bind(this);
		this.onModeB = this.onModeB.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
	}
	componentWillReceiveProps (newProps) {
		// body...
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
		setTimeout(function () {
			// body...
			self.props.calibB()
		},100)

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
	render () {
		var ls = {display:'inline-block', width:120}
		var self = this;
		var modes = ['dry','wet','DSA']
		var colors = ['#c8c8c8',"#c8c800","#00c8c8", "#0000c8"]
		var ledcolors = ["#ffffff","#00ff00","#ff0000"]

		var opsA = modes.map(function (m,i) {
			// body...
			if(self.state.phaseMode == i){
				return <option value={i} selected>{m}</option>
			}else{
				return <option value={i}>{m}</option>
			}
		})
		var opsB = modes.map(function (m,i) {
			// body...
			if(self.state.phaseModeB == i){
				return <option value={i} selected>{m}</option>
			}else{
				return <option value={i}>{m}</option>
			}
		})
	  	console.log(vdefMapV2['@labels']['Channel A'])
	  	console.log(this.props.language)
		return	<div style={{ overflow: 'hidden',borderRadius: 20, border: '8px solid #818a90',boxShadow: '0 0 14px black'}}>

		<table style={{borderSpacing:0}}>
			<tbody>
				<tr>
					<td style={{width:340, background:'#818a90', textAlign:'center'}}>
						<div style={{marginTop:15}}><KeyboardInputTextButton label={vdefMapV2['@labels']['Channel A'][this.props.language]['name']} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phase} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.phaseSpeed]} rstyle={{backgroundColor:ledcolors[this.state.pled_a]}} overrideBG={true}/></div>
						<div hidden><div className='customSelect' style={{width:150}}><select onChange={this.onModeA}>{opsA}</select></div></div>
				
						<div style={{marginBottom:15}}><CircularButton style={{width:228}} lab={vdefMapV2['@labels']['Calibrate'][this.props.language]['name']} isTransparent={true} inverted={false} onClick={this.onCalA}/></div>
					</td>
					<td  style={{width:220,textAlign:'center', background:'linear-gradient(55deg, #818a90, #818a90 49.9%,#362c66 50.1%, #362c66)'}}>
					<CircularButton lab={vdefMapV2['@labels']['Calibrate All'][this.props.language]['name']} isTransparent={true} inverted={false} onClick={this.calibrateAll} /></td><td  style={{width:340, textAlign:'center', background:'#362c66'}}>
						<div style={{marginTop:15}}><KeyboardInputTextButton label={vdefMapV2['@labels']['Channel B'][this.props.language]['name']}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phaseb} onInput={this.onPhaseB} inverted={true} bgColor={colors[this.state.phaseSpeedB]} rstyle={{backgroundColor:ledcolors[this.state.pled_b]}} overrideBG={true}/></div>
						<div hidden><div className='customSelect' style={{width:150}}><select onChange={this.onModeB}>{opsB}</select></div></div>
				
						<div style={{marginBottom:15}}><CircularButton style={{width:228}} lab={vdefMapV2['@labels']['Calibrate'][this.props.language]['name']} isTransparent={true} inverted={true} onClick={this.onCalB}/></div>
					</td>
				</tr>
			</tbody>
		</table>
			
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
						<div><KeyboardInputButton onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phase} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.phaseSpeed]} overrideBG={true}/></div>
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
		return(<div style={{background: 'linear-gradient(75deg, rgb(129, 138, 144), rgb(129, 138, 144) 49.9%,rgb(54, 44, 102) 50.1%, rgb(54, 44, 102))', borderRadius:15,border:'5px solid #818a90', boxShadow:'0 0 14px black'}}><div style={{display:'inline-block'}}>
			<div className='intmetSig' style={{color:'black'}} onClick={this.onSigA}>{this.state.sig}</div></div><div style={tbstyle}><TickerBox ref='tba'/></div>
				<div style={{display:'inline-block', width:19}}></div>
				<div style={tbstyle}><TickerBox ref='tbb'/>
				</div>
				<div style={{display:'inline-block'}}><div className='intmetSig' style={{color:'#eee'}} onClick={this.onSigB}>{this.state.sigB}</div></div>
				
				</div>)
	}
}

class KeyboardInputTextButton extends React.Component{
	constructor(props) {
		super(props)
		this.editValue = this.editValue.bind(this)
		this.onFocus = this.onFocus.bind(this);
		this.onInput = this.onInput.bind(this);
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
	render() {
		var bgColor='rgba(200,200,200,1)'
		var rstyle = {}
	
		if(this.props.overrideBG){
			bgColor = this.props.bgColor || bgColor
			rstyle = this.props.rstyle || rstyle
		}
		rstyle.padding = 8;
		var boxShadow = '0px 0px 0px 50px '+bgColor
		var lab2 = this.props.lab2 || "";
		var ckb = <CustomKeyboard ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.label + lab2 +': ' + this.props.value}/>
		//var kb = <KeyboardInput onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} Style={{fontSize:25, textAlign:'center', width:75}} onInput={this.onInput} ref='input' value={this.props.value}/>
		var	kb = <label style={{fontSize:25, textAlign:'center', width:75, display:'inline-block', lineHeight:'54px'}} onClick={this.editValue}>{this.props.value}</label>
		
		if(!this.props.isEditable){
			ckb = ""
		}
		if(this.props.inverted){
		var before = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:44,left:2,backgroundColor:bgColor,borderRadius:22, height:54}
		var after = {position:'absolute',height:'100%',display:'inline-block',top:0,width:44,left:92,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:22, height:54}
		var contStyle= {display:'inline-block',width:75,position:'absolute',left:14,overflow:'hidden', height:54, backgroundColor:bgColor, zIndex:2, borderRadius:10}
   		
		return (
			<div className='keyboardInputTextButton'>
			<div className='round-bg' onClick={this.editValue} style={rstyle}>
				<div className='pbContain' style={{display:'table-cell', width:105}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
				<div className='tbDiv'>{this.props.label}</div>
					
			</div>
			{ckb}
			</div>
		);
		}else{
		var after = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:44,left:55,backgroundColor:bgColor,borderRadius:22, height:54}
		var before = {position:'absolute',height:'100%',display:'inline-block',top:0,width:44,left:-32,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:22, height:54}
		var contStyle= {display:'inline-block',width:75,position:'absolute',left:14,overflow:'hidden', height:54, backgroundColor:bgColor, zIndex:2, borderRadius:10}
  	
		return (
			<div className='keyboardInputTextButton'>
			<div className='round-bg' onClick={this.editValue} style={rstyle}>
				<div className='tbDiv'>{this.props.label}</div>
				<div className='pbContain' style={{display:'table-cell', width:105}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
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
		//this.onClick = this.onClick.bind(this)
		this.onChange = this.onChange.bind(this);
	}
	toggle () {
		var self   = this;
		setTimeout(function () {
			self.setState({show:true})
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
				if(self.props.onRequestClose){
					self.props.onRequestClose();
				}
			},80)
		}
		
	}
	onChange (value) {
		this.props.onChange(value, this.props.index, this.props.index2);
		this.close();
	}
	render () {
		var cont = "";
		if(this.state.show){
			cont = <CustomKeyboardCont onChange={this.onChange} show={this.state.show} close={this.close} value={this.props.value} num={this.props.num} label={this.props.label}/>
		}
		return <div hidden={!this.state.show} className = 'pop-modal'>
			<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40"><path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" /></svg>
			</div>
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
		}else if(char == 'space'){
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
		// body...
		this.setState({value:""})
	},
	onShift :function() {
		// body...
		this.setState({shift:!this.state.shift})
	},
	render:function () {
		// body...
		var self = this;
		var NumericKeyset = [['cancel','-','del'],['7','8','9'],['4','5','6'],['1','2','3'],['0','.','enter']]
		var ANumericKeyset = [ ['1','2','3','4','5','6','7','8','9','0'],['q','w','e','r','t','y','u','i','o','p'],
							['a','s','d','f','g','h','j','k','l','del'],['shift','z','x','c','v','b','n','m','-','shift'],
							['cancel','@','#','space','.','enter']]
		var rows = ""
		var width = 290;
		var caps = this.state.shift
		if(this.props.num){
			rows = NumericKeyset.map(function (row) {
				var tds = row.map(function(k){
					console.log(k)
					return <CustomKey Key={k}  caps={false} onPress={self.onKeyPress}/>
				})
				return <tr>{tds}</tr>
			})
		}else{
			rows = ANumericKeyset.map(function (row) {
				var tds = row.map(function(key){
					if(caps){
						if (key.length == 1){
							key = key.toUpperCase();
						}
					}
					return <CustomKey Key={key} caps={caps} onPress={self.onKeyPress}/>
				})
				return <tr>{tds}</tr>
			})
			width = 940
		}
		return <div style={{paddingLeft:7,paddingRight:7}} className = 'selectmodal-outer'>
		<label style={{color:'#a0a0a0',fontSize:25,width:400,marginRight:'auto',marginLeft:'auto',display:'block'}}>
			{this.props.label}</label>
		<div style={{background:'rgba(150,150,150,0.3)',fontSize:25,lineHeight:2,textDecoration:'underline',textUnderlinePosition:'under',textDecorationColor:'rgba(200,200,200,0.7)',height:54,color:'#eee', whiteSpace:'pre',width:width - 4, marginTop:5,marginLeft:'auto',marginRight:'auto'}}>{this.state.value}</div>
		<div style={{width:width,marginLeft:'auto',marginRight:'auto'}}>
		<table style={{tableLayout:'fixed', position:'relative', top:0,width:width}}className='customKeyboardTable'><tbody>
			{rows}
		</tbody></table>
		
	  	
		</div>
		<div><button style={{height:50, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:150, borderRadius:20}} onClick={this.onEnter}>Accept</button><button style={{height:50, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:150, borderRadius:20}} onClick={this.close}>Cancel</button></div>
		</div>
	}
}))
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
		if(this.props.Key == 'space'){
			return	<td onClick={this.onPress} className='customKey' colSpan={5}><div style={{marginBottom:-15}}><svg xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M18 9v4H6V9H4v6h16V9z"/></svg></div></td>
		}else if(this.props.Key == 'del'){
			return	<td onClick={this.onPress} className='customKey'><div style={{marginBottom:-15}}><svg xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z"/></svg></div></td>
		}else if(this.props.Key == 'enter'){


			return <td onClick={this.onPress} className='customKey'><div style={{marginBottom:-15}}><svg xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/></svg></div></td>
		}else if(this.props.Key == 'shift'){
			var fill = "#000000"
			var st = {}
			if(this.props.caps){
				fill = "#eeeeee"
				st={background:'#808a90'}
			}
			return <td style={st} onClick={this.onPress} className='customKey'><div style={{marginBottom:-15}}><svg fill={fill} xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M12 8.41L16.59 13 18 11.59l-6-6-6 6L7.41 13 12 8.41zM6 18h12v-2H6v2z"/></svg></div></td>
		}else if(this.props.Key == 'cancel'){
			return <td onClick={this.onPress} className='customKey'><div style={{marginBottom:-15}}><svg xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg></div></td>
			
		}else{

			return <td onClick={this.onPress} className='customKey'>{this.props.Key.slice(0,1)}</td>
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
		////console.log("render")
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
		var l1 = new TimeSeries();
		var l2 = new TimeSeries();
		this.state =  ({line:l1, line_b:l2})
		this.stream = this.stream.bind(this);
	}
	componentDidMount(){
		var smoothie = new SmoothieChart({millisPerPixel:25,interpolation:'linear',maxValueScale:1.1,minValueScale:1.2,
		horizontalLines:[{color:'#000000',lineWidth:1,value:0},{color:'#880000',lineWidth:2,value:100},{color:'#880000',lineWidth:2,value:-100}],labels:{fillStyle:'#808a90'}, grid:{fillStyle:'rgba(256,256,256,0)'}, yRangeFunction:yRangeFunc});
		smoothie.setTargetFPS(24)
		smoothie.streamTo(document.getElementById(this.props.canvasId));

		if(this.props.int){
			smoothie.addTimeSeries(this.state.line_b, {lineWidth:2,strokeStyle:'rgb(128, 128, 128)'});
			smoothie.addTimeSeries(this.state.line, {lineWidth:2,strokeStyle:'rgb(128, 0, 128)'});
		
		}else{
			smoothie.addTimeSeries(this.state.line, {lineWidth:2,strokeStyle:'#ff00ff'});
	
		}
	}
	stream(dat) {
		this.state.line.append(dat.t, dat.val);
		this.state.line.dropOldData(1000, 3000)
		if(this.props.int){
			this.state.line_b.append(dat.t, dat.valb)
			this.state.line_b.dropOldData(1000, 3000)
		
		}
	}
	render(){
		return(
			<div className="canvElem">
				<canvas id={this.props.canvasId} height={this.props.h} width={this.props.w}></canvas>
			</div>
		);
	}
}
ReactDOM.render(<Container/>,document.getElementById('content'))

