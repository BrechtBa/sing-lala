import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import './App.css'
import { Button, TextField } from '@mui/material'
import { motion } from "motion/react"


interface TimedLyric {
  delay: number;
  text: string;
}

function AnimatedTextTop({text}: {text: string}){

  return (
    <motion.div 
      initial={{ transform: "translateY(1.75em)", fontSize: "0.75em", color: "var(--next-lyrics-color)"}}
      animate={{ transform: "translateY(0px)", fontSize: "1em", color: "var(--lyrics-color)"}}
      transition={{
        duration: 0.5,
      }}
        key={crypto.randomUUID()}>
      {text}
    </motion.div>
  )
}


function AnimatedTextBottom({text}: {text: string}){
  return (
      <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.25,
            delay: 0.25,
          }}
          key={crypto.randomUUID()}>
        {text}
      </motion.span>
  )
}

function DisplayLyricsArray({timedLyrics, index}: {timedLyrics: Array<TimedLyric>, index: number}) {

  return (
    <div>
      <div style={{color: "var(--lyrics-color)", textAlign: "center", fontSize: "4em"}}>
        {timedLyrics[index] === undefined ? <span>&nbsp;</span> : timedLyrics[index].text === "" ? <span>&nbsp;</span> : <AnimatedTextTop text={timedLyrics[index].text}/> }
      </div>
      <div style={{color: "var(--next-lyrics-color)", textAlign: "center", fontSize: "3em"}}>
        {timedLyrics[index+1] === undefined ? <span>&nbsp;</span> : timedLyrics[index+1].text === "" ? <span>&nbsp;</span> : <AnimatedTextBottom text={timedLyrics[index+1].text}/>}
      </div>
    </div>
  )
}

function Player({timedLyrics, index, setIndex, controls}: {timedLyrics: Array<TimedLyric>, index: number, setIndex: Dispatch<SetStateAction<number>>, controls?: ReactNode}) {
  
  return (
    <div style={{display: "flex", width: "100%", height: "100%", flexDirection: "column"}}>
      <div style={{flexGrow: 1, display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center"}}>
        <DisplayLyricsArray timedLyrics={timedLyrics} index={index}/>
      </div>
      <div style={{display: "flex", flexDirection: "row-reverse", justifyContent: "flex-start", gap: "1em", width: "100%"}}>

        <Button variant="contained" onClick={() => setIndex(v => v+1)} disabled={index === timedLyrics.length}>Next</Button>

        {controls !== undefined && controls}

      </div>
    </div>
  )
}

function TimingPlayer({timedLyrics, setTimedLyrics}: {timedLyrics: Array<TimedLyric>, setTimedLyrics: Dispatch<SetStateAction<Array<TimedLyric>>>}) {
  const [index, setIndex] = useState(0);
  const [play, setPlay] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());

  useEffect(() => {
    if(play && index < timedLyrics.length + 1){

      const now = new Date();
      const delay = now.getTime() - startTime.getTime();
      console.log(delay)

      if(index > 0) {
        setTimedLyrics(v => v.map((val, idx) => (idx === index-1 ? {...val, delay: delay} : val)));
      }
      setStartTime(now);
    }

    return () => {};
  }, [play, index])

  return (
    <Player timedLyrics={timedLyrics} index={index} setIndex={setIndex} controls={(
      <div>
        {!play && (<Button variant="contained" onClick={() => setPlay(true)}>Start</Button>)}
      </div>
    )}/>
  )
}



function AutoPlayer({timedLyrics}: {timedLyrics: Array<TimedLyric>}) {
  const [index, setIndex] = useState(0);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if(play && index < timedLyrics.length){
      const timerId = setTimeout(()=> {
        setIndex(v => v+1)
      }, timedLyrics[index].delay);

      return () => clearTimeout(timerId);
    }

    return () => {};
  }, [play, index, timedLyrics])

  return (
    <Player timedLyrics={timedLyrics} index={index} setIndex={setIndex} controls={(
      <div style={{display: "flex", gap: "1em"}}>
        
        {!play && (<Button variant="contained" onClick={() => setPlay(true)}>Play</Button>)}
        {play && (<Button variant="contained" onClick={() => setPlay(false)}>Pause</Button>)}

        <Button variant="contained" onClick={() => setIndex(v => v-1)} disabled={index === 0 }>Back</Button>
      </div>
    )}/>
  )
}


enum State {
  lyrics = 1,
  timing,
  play,
}

function App() {
  const [state, setState] = useState<State>(State.lyrics);

  const [lyrics, setLyrics] = useState<Array<string>>([]);
  const [timedLyrics, setTimedLyrics] = useState<Array<TimedLyric>>([]);


  useEffect(()=> {
    // check localstorage for timedLyrics
    const storedTimedLyrics = localStorage.getItem("timedLyrics");
    if (storedTimedLyrics !== null) {
      const parsedTimedLyrics = JSON.parse(storedTimedLyrics);
      
      setTimedLyrics(parsedTimedLyrics);
      setLyrics(parsedTimedLyrics.map((v: TimedLyric) => v.text));
    }
  }, []);
  
  useEffect(()=> {
    if (timedLyrics.length > 0) {
      // store timedLyrics on change
      localStorage.setItem("timedLyrics", JSON.stringify(timedLyrics));
    }
  }, [timedLyrics]);


  const updateLyrics = (value: string) => {
    const lyrics = value.split("\n")
    const newTimedLyrics = lyrics.map((val, index) => {
      return {
        delay: timedLyrics[index] === undefined ? 5000 : timedLyrics[index].delay, 
        text: val
      };
    });
    setLyrics(lyrics);
    setTimedLyrics(newTimedLyrics);
  }

  const exportLyrics = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(timedLyrics)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "lyrics.json";
    link.click();
  };

  const onFileChange = async (event: any) => {
    try {
      const file = event.target.files[0];
      console.log(file);
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");

      reader.onload = (e) => {
        if(e === null || e.target === null || e.target.result === null) {
          return;
        }
        const parsedTimedLyrics = JSON.parse(e.target.result as string);
        setTimedLyrics(parsedTimedLyrics);
        setLyrics(parsedTimedLyrics.map((v: TimedLyric) => v.text));
      }
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <>
      <div style={{display: "flex", flexDirection: "column", gap: "1em", margin: "1em", height: "90%"}}>
        <div>
          {state === State.lyrics && (
            <div style={{display: "flex", gap: "1em"}}>
              <Button variant="contained" onClick={() => setState(State.play)}>Play</Button>
              <Button variant="contained" onClick={() => setState(State.timing)}>Measure timing</Button>
              <Button variant="contained" onClick={() => exportLyrics()}>Export</Button>
              <Button variant="contained" component="label">Import <input type='file' id='file' accept="json/*" style={{display: 'none'}} onChange={onFileChange}/></Button>
              {/* <Button variant="contained" onClick={() => import()}>Export</Button> */}
            </div>
          )}
          {state === State.play && (
            <Button variant="contained" onClick={() => setState(State.lyrics)}>Stop</Button>
          )}
          {state === State.timing && (
            <Button variant="contained" onClick={() => setState(State.lyrics)}>Stop</Button>
          )}
        </div>
        
        <div style={{flexGrow: 1}}>
          {state === State.lyrics && (
            <div style={{display: "flex", gap: "1em"}}>
              <div style={{flexGrow: 1}}>
                <TextField value={lyrics.join("\n")} multiline onChange={(e) => updateLyrics(e.target.value)} style={{width: "100%"}} minRows={20}/>
              </div>
              <div style={{flexGrow: 1}}>
                {timedLyrics.map((val, index) => (
                  <div key={index} style={{display: "flex", flexDirection: "row", gap: "2em"}}>
                    <div> <TextField value={(val.delay)} onChange={(e) => setTimedLyrics(v => v.map((val, idx) => (idx === index ? {...val, delay: parseInt(e.target.value)} : val)))} variant="standard" style={{width: "4em"}}/> ms</div>
                    <div style={{flexGrow: 1}}>{val.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {state === State.play && (
            <AutoPlayer timedLyrics={timedLyrics}/>
          )}

          {state === State.timing && (
            <TimingPlayer timedLyrics={timedLyrics} setTimedLyrics={setTimedLyrics}/>
          )}
        </div>
      </div>

    </>
  )
}

export default App
