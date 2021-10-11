import { 
  Component,
  OnInit,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild } from '@angular/core';
import { SearchResult } from 'src/app/models/search-result.model';
import { YoutubeSearchService } from 'src/app/services/youtube-search.service';
import { fromEvent, observable } from 'rxjs';
import { Observable } from 'rxjs';
import { map, filter, switchAll, debounceTime, tap } from 'rxjs/operators';


@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent implements OnInit {

  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() results: EventEmitter<SearchResult[]> = new EventEmitter<SearchResult[]>();
  @ViewChild("search") search!: ElementRef;

  constructor(private youtube: YoutubeSearchService, private el: ElementRef) { }

  ngOnInit(): void {
   

    let obs = fromEvent(this.el.nativeElement, 'keyup')
    .pipe (
        map((e:any) => e.target.value), 
        // extraemos el valor del input
        filter((text:string) => text.length > 1), 
        //Este filtro significa que la transmisión no emitirá ninguna cadena de búsqueda para la que la longitudes menor que uno
        debounceTime(250), 
        //debounceTime significa que aceleraremos las solicitudes que lleguen en más de 250 ms,es decir, no buscaremos con cada pulsación de tecla, sino después de que el usuario haya detenido una pequeña Monto
        tap(() => this.loading.emit(true)), // Enable loading
        // search, call the search service
        map((query:string) => this.youtube.search(query)), 
        // Usamos .map para llamar a realizar una búsqueda por cada consulta que se emite
        switchAll()
        // Usando el interruptor Básicamente, estamos diciendo "ignorar todos los eventos de búsqueda, excepto el más reciente". Es decir, si un entra una nueva búsqueda, queremos usar la más reciente y descartar el resto.
        ).subscribe(
          (results: SearchResult[]) =>{
            console.log(results);
            this.loading.emit(false);
            this.results.emit(results);
          },
          (err: any) =>{
            console.log(err);
          },
          () =>{
            this.loading.emit(false);
          }
        )
  }

}
