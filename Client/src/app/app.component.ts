import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShowTopicComponent } from './topic/show-topic/show-topic.component';
import { HttpClientModule } from '@angular/common/http';
import { Title } from '@angular/platform-browser'; // Import the Title service

@Component({
  selector: 'app-root', // The component's CSS selector
  standalone: true, // Marks the component as standalone
  imports: [RouterOutlet, ShowTopicComponent, HttpClientModule], // Imports necessary modules and components
  templateUrl: './app.component.html', // The location of the component's template file
  styleUrls: ['./app.component.css'] // The location of the component's private CSS styles
})
export class AppComponent implements OnInit {
  title = 'angular17-blogexplorer-api'; // Property for the application's title

  constructor(private titleService: Title) { } // Inject the Title service

  ngOnInit() {
    this.titleService.setTitle('BlogExplorer'); // Set the browser tab title
  }
}

