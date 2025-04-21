export interface TimedLyric {
  delay: number;
  text: string;
}

export interface MetaData {
  title: string;
}

export interface Song {
  id: string;
  metadata: MetaData;
  timedLyrics: Array<TimedLyric>;
}


class UseCases {
  private songMetadataKey = "songMetadata";

  constructor(){}

  listSongs(): {[id: string]: MetaData} {
    const songMetadata = localStorage.getItem(this.songMetadataKey);
    if (songMetadata !== null) {
      const songs = JSON.parse(songMetadata);
      return songs;
    }
    return {}
  }

  private getSongLyrics(id: string): Array<TimedLyric> {
    const songLyricsString = localStorage.getItem(this.getSongLyricsKey(id));
    if (songLyricsString !== null) {
      return JSON.parse(songLyricsString);
    }
    return [];
  }

  getSong(id: string): Song {
    const metadata = this.listSongs()[id];
    if(metadata === undefined){
      throw Error("404")
    }

    const lyrics = this.getSongLyrics(id) 

    return {
      id: id,
      metadata: metadata,
      timedLyrics: lyrics
    };
  }

  addSong(metadata: MetaData, timedLyrics: Array<TimedLyric>) {
    const id = this.makeId();
    let songs = this.listSongs()
    songs[id] = metadata;
    localStorage.setItem(this.songMetadataKey, JSON.stringify(songs));
    localStorage.setItem(this.getSongLyricsKey(id), JSON.stringify(timedLyrics))
  }

  storeSongLyrics(id: string, timedLyrics: Array<TimedLyric>): void {
    localStorage.setItem(this.getSongLyricsKey(id), JSON.stringify(timedLyrics));
  }

  storeSongMetaData(id: string, metadata: MetaData): void {
    const songs = this.listSongs()
    songs[id] = metadata;
    localStorage.setItem(this.songMetadataKey, JSON.stringify(songs));
  }

  editLyrics(timedLyrics: Array<TimedLyric>, lyrics: string): Array<TimedLyric> {
    const newLyrics = lyrics.split("\n")
    const newTimedLyrics = newLyrics.map((val, index) => {
      return {
        delay: timedLyrics[index] === undefined ? 5000 : timedLyrics[index].delay, 
        text: val
      };
    });

    return newTimedLyrics;
  }

  deleteSong(id: string) {
    let songs = this.listSongs()
    delete songs[id];
    localStorage.setItem(this.songMetadataKey, JSON.stringify(songs));
    localStorage.removeItem(this.getSongLyricsKey(id));
  }

  importCollection(file: any) {
    try {
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");

      reader.onload = (e) => {
        if(e === null || e.target === null || e.target.result === null) {
          return;
        }
        const collection = JSON.parse(e.target.result as string);

        // remove old data
        for (var key in localStorage){
          localStorage.removeItem(key); 
       }

        // store new data
        collection.forEach((song: {metaData: MetaData, timedLyrics: Array<TimedLyric>}) => {
          const id = this.makeId()
          this.storeSongMetaData(id, song.metaData);
          this.storeSongLyrics(id, song.timedLyrics);
        });

      }
    } catch (err) {
      console.error(err);
    }
  }

  exportCollection(): string {
    const data = Object.entries(this.listSongs()).map(([key, val]) => ({
      metaData: val,
      timedLyrics: this.getSongLyrics(key)
    }));
    return JSON.stringify(data)
  }


  private makeId(): string {
    return crypto.randomUUID();
  } 

  private getSongLyricsKey(id: string): string {
    return `songLyrics-${id}`
  }

}


const useCases = new UseCases();

export default useCases;