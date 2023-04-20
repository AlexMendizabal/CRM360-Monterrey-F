import { element } from 'protractor';
import { Component, OnInit, AfterViewInit, ViewChildren } from '@angular/core';
import { subscribeOn } from 'rxjs/operators';

@Component({
  selector: 'drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss']
})
export class LogisticaYmsAgendamentosDragAndDropComponent implements OnInit, AfterViewInit {
  dropzones: any
  id= 8
  loading:boolean=false;
  circuitos= [
    {
      id:1,
      descricao: 'Portaria',
      icone:'fas fa-portrait',
      check: 1
    },
    {
      id:2,
      descricao: 'Balança',
      icone:'fas fa-balance-scale-left',
      check: 0

    },
    {
      id:3,
      descricao: 'Estacionamento',
      icone:'fas fa-sign',
      check: 0
    },
    {
      id:4,
      descricao: 'Galpão 2',
      icone:'fas fa-warehouse',
      check: 0

    },
    {
      id:5,
      descricao: 'Galpão 27',
      icone:'fas fa-warehouse',
      check: 0
    },    {
      id:6,
      descricao: 'Balança',
      icone:'fas fa-balance-scale-left',
      check: 0

    },
    {
      id:7,
      descricao: 'Finalizado',
      icone:'fas fa-check',
      check: 0
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    const dropzones = document.querySelectorAll(".dropzone")
    const cards = document.querySelectorAll(".card")
    cards.forEach(card =>{
      card.addEventListener('dragstart', dragstart)
      card.addEventListener('drag', drag)
      card.addEventListener('dragend', dragend)
    })

    dropzones.forEach(dropzone =>{
      dropzone.addEventListener('dragenter',dragenter)
      dropzone.addEventListener('dragover', dragover)
      dropzone.addEventListener('dragleave', dragleave)
      dropzone.addEventListener('drop',drop)
    })

    function dragstart(){
      dropzones.forEach(dropzones =>dropzones.classList.add('highlight'));
      this.classList.add('is-dragging')
    }

    function drag(){
      // console.log('drag')
    }
  
    function dragend(){
      dropzones.forEach(dropzone =>{
        dropzone.classList.remove('highlight');
        if(dropzone.childElementCount == 2){
          return
        }
        
        for (let i = 0; i < dropzone.children.length ; i++) {
          let item = dropzone.children[i].classList.contains('dropzone-item')
          if(item){
            dropzone.children[i].classList.add('d-none')
          }
        }
      });
      this.classList.remove('is-dragging')
    }
  
  
    function dragenter(){
    }
  
    function dragover(){

    for (let i = 0; i < this.children.length ; i++) {
      let item = this.children[i].classList.contains('d-none')
      if(item){
        this.children[i].classList.remove('d-none')
      }
    }

      const cardBeingDragged = document.querySelector('.is-dragging')
      this.classList.remove('highlight')
      this.appendChild(cardBeingDragged)
    }

    function dragleave(){
      this.classList.add('highlight')
    }
  
    function drop(){

    }

  }

  





}
