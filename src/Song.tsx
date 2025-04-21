import { useEffect, useState } from 'react'
import { Button,TextField } from '@mui/material'

import { NavLink, useParams } from 'react-router';
import useCases, { MetaData, Song, TimedLyric } from './useCases';

import { Layout, MyDialog } from './Components';
import { AutoPlayer, TimingPlayer } from './Player';


export function PlaySong() {
  const {id} = useParams();

  const [song, setSong] = useState<Song | null>(null);

  useEffect(()=> {
    if( id !== undefined){
      setSong(useCases.getSong(id));
    }
    else {
      setSong(null);
    }

  }, [id]);

  return (
    <Layout menu={
      <div style={{display: "flex", flexDirection: "row", gap: "0.5em", justifyContent: "flex-end"}}>
        <NavLink to="/"><Button variant="contained">List songs</Button></NavLink>
        {song !== null && (<NavLink to={`/${song.id}/edit`}><Button variant="contained">Edit</Button></NavLink>)}
      </div>
    } content={
      song !== null && (
        <AutoPlayer title={song.metadata.title} timedLyrics={song.timedLyrics}/>
      )
    } />
  )
}


export function EditSong() {
  const {id} = useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [deleteSongDialogOpen, setDeleteSongDialogOpen] = useState(false);

  useEffect(()=> {
    if( id !== undefined){
      setSong(useCases.getSong(id));
    }
    else {
      setSong(null);
    }

  }, [id]);

  const updateLyrics = (lyrics: string) => {
    if(id===undefined || song === null) {
      return;
    }

    const newTimedLyrics = useCases.editLyrics(song.timedLyrics, lyrics);
    useCases.storeSongLyrics(id, newTimedLyrics);
    setSong({...song, timedLyrics: newTimedLyrics});
  }

  const updateMetadata = (metaData: MetaData) => {
    if(id===undefined || song === null) {
      return;
    }

    useCases.storeSongMetaData(id, metaData);
    setSong({...song, metadata: metaData});
  }

  return (
    <Layout menu={
      <div style={{display: "flex", flexDirection: "row", gap: "0.5em", justifyContent: "flex-end"}}>
        <NavLink to={"/"}><Button variant="contained">List songs</Button></NavLink>
        {song !== null && (<NavLink to={`/${song.id}`}><Button variant="contained">Play</Button></NavLink>)}
        {song !== null && (<NavLink to={`/${song.id}/edit/timing`}><Button variant="contained">Measure timing</Button></NavLink>)}
        {song !== null && (<Button variant="outlined" onClick={() => setDeleteSongDialogOpen(true)}>Delete</Button>)}
        {song !== null && (
          <MyDialog open={deleteSongDialogOpen} setOpen={setDeleteSongDialogOpen} title={"Are you sure?"}>

            <div style={{display: "flex", flexDirection: "row", gap: "0.5em", margin: "0.5em"}}>
              <NavLink to={"/"}><Button variant="contained" onClick={() => {useCases.deleteSong(song.id); setDeleteSongDialogOpen(false); }}>Delete</Button></NavLink>
              <Button variant="outlined" onClick={() => setDeleteSongDialogOpen(false)}>Cancel</Button>
            </div>
          </MyDialog>
        )}
      </div>
    } content={
      song !== null && (
        <div style={{display: "flex", gap: "1em", flexDirection: "column"}}>

          <TextField value={song.metadata.title} label="title" onChange={(e) => updateMetadata({...song.metadata, title: e.target.value})} style={{width: "100%"}}/>

          <div style={{display: "flex", gap: "1em"}}>
            <div style={{flexGrow: 1}}>
              <TextField value={song.timedLyrics.map((v: TimedLyric) => v.text).join("\n")} multiline onChange={(e) => updateLyrics(e.target.value)} style={{width: "100%"}} minRows={20}/>
            </div>
            <div style={{flexGrow: 1}}>
              {song.timedLyrics.map((val, index) => (
                <div key={index} style={{display: "flex", flexDirection: "row", gap: "2em"}}>
                  <div> <TextField value={(val.delay)} onChange={(e) => setSong({...song, timedLyrics: song.timedLyrics.map((val, idx) => (idx === index ? {...val, delay: parseInt(e.target.value)} : val))})} variant="standard" style={{width: "4em"}}/> ms</div>
                  <div style={{flexGrow: 1}}>{val.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    } />
  )
}



export function MeasureSongTiming() {
  const {id} = useParams();
  const [song, setSong] = useState<Song | null>(null);

  useEffect(()=> {
    if(id !== undefined){
      setSong(useCases.getSong(id));
    }
    else {
      setSong(null);
    }

  }, [id]);

  const setTimedLyrics = (value: Array<TimedLyric>) => {

    if(id === undefined || song === null) {
      return;
    }

    useCases.storeSongLyrics(id, value);
    setSong({...song, timedLyrics: value});
  }

  return (
    <Layout menu={
      <div style={{display: "flex", flexDirection: "row", gap: "0.5em", justifyContent: "flex-end"}}>
        {song !== null && (<NavLink to={`/${song.id}/edit`}><Button variant="contained">Back</Button></NavLink>)}
      </div>
    } content={
      song !== null && (
        <TimingPlayer title={song.metadata.title} timedLyrics={song.timedLyrics} setTimedLyrics={setTimedLyrics}/>
      )
    } />
  )
}