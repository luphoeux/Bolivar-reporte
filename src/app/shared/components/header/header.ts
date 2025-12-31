import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeatherIcons } from '../feather-icons/feather-icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FeatherIcons],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
}
