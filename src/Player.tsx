import { Button } from "@mui/material";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";

import { motion } from "motion/react"

import { TimedLyric } from "./useCases";


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

function Player({title, timedLyrics, index, setIndex, controls}: {title: string, timedLyrics: Array<TimedLyric>, index: number, setIndex: Dispatch<SetStateAction<number>>, controls?: ReactNode}) {
  
  return (
    <div style={{display: "flex", width: "100%", height: "100%", flexDirection: "column"}}>
      <div style={{flexGrow: 1, display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center"}}>
        {index >= 0 && (
          <DisplayLyricsArray timedLyrics={timedLyrics} index={index}/>
        )}
        {index < 0 && (
          <div style={{color: "var(--lyrics-color)", textAlign: "center", fontSize: "4em"}}>{title}</div>
        )}
      </div>
      <div style={{display: "flex", flexDirection: "row-reverse", justifyContent: "flex-start", gap: "1em", width: "100%"}}>

        <Button variant="contained" onClick={() => setIndex(v => v+1)} disabled={index === timedLyrics.length}>Next</Button>

        {controls !== undefined && controls}

      </div>
    </div>
  )
}


export function TimingPlayer({title, timedLyrics, setTimedLyrics}: {title: string, timedLyrics: Array<TimedLyric>, setTimedLyrics: (lyrics: Array<TimedLyric>) => void}) {
  const [index, setIndex] = useState(-1);
  const [play, setPlay] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());

  useEffect(() => {
    if(play && index < timedLyrics.length + 1){

      const now = new Date();
      const delay = now.getTime() - startTime.getTime();

      if(index > 0) {
        setTimedLyrics(timedLyrics.map((val, idx) => (idx === index-1 ? {...val, delay: delay} : val)));
      }
      setStartTime(now);
    }

    return () => {};
  }, [play, index])

  const doPlay = () => {
    if(index < 0){
      setIndex(0);
    }
    setPlay(true)
  }

  return (
    <Player title={title} timedLyrics={timedLyrics} index={index} setIndex={setIndex} controls={(
      <div>
        {!play && (<Button variant="contained" onClick={() => doPlay()}>Start</Button>)}
      </div>
    )}/>
  )
}



export function AutoPlayer({title, timedLyrics}: {title: string, timedLyrics: Array<TimedLyric>}) {
  const [index, setIndex] = useState(-1);
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

  const doPlay = () => {
    if(index < 0){
      setIndex(0);
    }
    setPlay(true)
  }

  return (
    <Player title={title}  timedLyrics={timedLyrics} index={index} setIndex={setIndex} controls={(
      <div style={{display: "flex", gap: "1em"}}>
        
        {!play && (<Button variant="contained" onClick={() => doPlay()}>Play</Button>)}
        {play && (<Button variant="contained" onClick={() => setPlay(false)}>Pause</Button>)}

        <Button variant="contained" onClick={() => {setPlay(false); setIndex(-1)}} disabled={index === -1}>Reset</Button>
        <Button variant="contained" onClick={() => setIndex(v => v-1)} disabled={index <= 0 }>Back</Button>
      </div>
    )}/>
  )
}
