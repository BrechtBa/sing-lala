import { useEffect, useState } from "react";
import { Button, Fab, Paper, TextField } from "@mui/material";
import { NavLink } from "react-router";
import AddIcon from '@mui/icons-material/Add';

import { Layout, MyDialog } from "./Components";

import useCases, { MetaData } from "./useCases";


export function ListSongs() {
  const [songs, setSongs] = useState<Array<{id: string, metadata: MetaData}>>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newMetaData, setNewMetaData] = useState<MetaData>({title: ""});

  useEffect(()=> {
    setSongs(Object.entries(useCases.listSongs()).map(([key, val]) => ({id: key, metadata: val})))
  }, []);


  const addSong = () => {
    setAddDialogOpen(false);
    useCases.addSong(newMetaData, []);
    setSongs(Object.entries(useCases.listSongs()).map(([key, val]) => ({id: key, metadata: val})));
  };

  const importCollection = async (event: any) => {
    try {
      const file = event.target.files[0];

      useCases.importCollection(file);
      setSongs(Object.entries(useCases.listSongs()).map(([key, val]) => ({id: key, metadata: val})))
    } catch (err) {
      console.error(err);
    }
  };

  const exportCollection = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      useCases.exportCollection()
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "lyrics-collection.json";
    link.click();
  };


  return (
    <Layout menu={
      <div style={{display: "flex", flexDirection: "row", gap: "0.5em", justifyContent: "flex-end"}}>
        <Button variant="contained" component="label">Import collection<input type='file' id='file' accept="json/*" style={{display: 'none'}} onChange={importCollection}/></Button>
        <Button variant="contained" onClick={() => exportCollection()}>Export collection</Button>
      </div>
    } content={
      <div style={{display: "flex", flexDirection: "column", gap: "0.5em"}}>
        {songs.map(song => (
          <NavLink to={`/${song.id}`} key={song.id}>
            <Paper style={{padding: "0.5em"}}>
              {song.metadata.title}
            </Paper>
          </NavLink>
        ))}
        <div style={{display: "flex", flexDirection: "row", gap: "0.5em", justifyContent: "center", marginTop: "0.5em"}}>
          <Fab onClick={() => setAddDialogOpen(true)}>
            <AddIcon />
          </Fab>
        </div>

        <MyDialog open={addDialogOpen} setOpen={setAddDialogOpen} title={<>Add song</>}>
          <div style={{display: "flex", flexDirection: "column", gap: "0.5em", margin: "0.5em"}}>
            <TextField value={newMetaData.title} label="title" onChange={e => setNewMetaData(v => ({...v, title: e.target.value}))}/>
          </div>

          <div style={{display: "flex", flexDirection: "row", gap: "0.5em", margin: "0.5em"}}>
            <Button variant="contained" onClick={() => addSong()}>Save</Button>
            <Button variant="outlined" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          </div>
        </MyDialog>
      </div>
    } />
  )
}
