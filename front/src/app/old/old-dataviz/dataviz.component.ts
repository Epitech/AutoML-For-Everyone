import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import { get_config_sweetviz_url as get_sweetviz_url } from '../../../api2';

@Component({
  selector: 'app-dataviz',
  templateUrl: './dataviz.component.html',
  styleUrls: ['./dataviz.component.css'],
})
export class DatavizComponent implements OnInit {
  @Input() id!: string;
  private sub: any;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.sub = this.route.params.subscribe((params) => {
      this.id = params['id'];
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  sweetviz = () =>
    this.sanitizer.bypassSecurityTrustResourceUrl(get_sweetviz_url(this.id!));
}
