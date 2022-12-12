import { Component, Inject, OnInit } from '@angular/core';
import { flyInOut, expand } from '../animations/app.animation';
import { LeaderService } from '../services/leader.service';
import {Leader} from "../shared/leader";


@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      expand()
    ]
})
export class AboutComponent implements OnInit {

  leaders: Leader[];

  constructor(private leaderservice: LeaderService,
    @Inject('BaseURL') public BaseURL) {

  }

  ngOnInit() {
    this.leaderservice.getLeaders().subscribe(leaders => this.leaders = leaders);

  }

}
