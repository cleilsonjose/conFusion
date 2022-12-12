import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProcessHTTPMsgService } from './process-httpmsg.service';
import { Feedback } from '../shared/feedback';
import { Observable } from 'rxjs';
import { baseURL } from '../shared/baseurl';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { }

    submitFeedback(feedBack: Feedback): Observable<Feedback>{
      const httpOptions = {
        headers: new HttpHeaders({'Content-type': 'application/json'})
      };
      return this.http.post<Feedback>(baseURL + 'feedBack/', feedBack, httpOptions)
      .pipe(catchError(this.processHTTPMsgService.handleError));
    }
}
