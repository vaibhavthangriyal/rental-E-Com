import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenStorage } from '../../../auth/token.storage';

@Injectable({
    providedIn: 'root'
  })
  
  export class SupportService{

    url= '/api/support/ticket';
    url2 = '/api/support/ticket/all';
    url3 = '/api/support/ticket/id';
    url4 ='/api/support/ticket/executive';
    url5 = '/api/support/ticket/followupconern'
    headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'token': this.tokenService.getToken()
      });
      constructor(private http: HttpClient, private tokenService: TokenStorage) { }

      // Tickets

      getAllTickets(){
        return this.http.get(this.url2 + '/' , { headers:this.headers} )
      }

      addTicket(ticket){
        return this.http.post(this.url + '/' , ticket , {headers:this.headers})
      }

      getTicketInfo(id){
        return this.http.get(this.url3 + '/' + id , { headers:this.headers} )
      }

      sendMessage(id,message){
        return this.http.put(this.url4 + '/' + id ,message, { headers:this.headers} )
      }

      // followUpTicket

      sendTicketFollowUp(id,followup){
        return this.http.put(this.url5 + '/' + id ,followup, { headers:this.headers} )
      }

  }