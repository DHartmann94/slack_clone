import { Injectable } from '@angular/core';
import { DocumentData, Firestore, QuerySnapshot, collection, getDocs, query } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';


export interface UserDataInterface {
  id: string; 
  text: string;
  time: Date;
  emojis: any;
  thread?: any;
  channel:string;
  mention: string; //ID from mentioned user
} 


@Injectable({
  providedIn: 'root'
})

export class ChatService {
  
}
