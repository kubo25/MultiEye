// test.c -- Tyzden 4 - Test
// Dominik Sojka, 11.10.2016 14:10:18


// 3 - tvar ziadny 
// 0.5 - riadky 
// 0 - stlpce       
// 0.5 - opakovanie
// 0.5 - struktura

#include <stdio.h>

int main()
{
  int p=0,v=0,s=0,r=0,i=0,j=0,u=0,w=0,pol=0,k=0,l=0,y=0,z=0;
  int m=0,n=0, o=0;
  char c='A';
  
  scanf("%d",&p); // toto musi ist do samostatnej funkcie
  if (p>=1 && p<=100){;} //kontrola spravnosti vstupu len pre p
    else printf("Nespravny vstup");

  scanf("%d %d %d",&v,&s,&r);
  
  if ((v>=1 && v<=7)&&(s>=1 && s<=5)){;}
    else printf("Nespravny vstup"); //kontrola spravnosti vstupu
  
  for(m=0;m<v;m++){ // opakovanie obrazka do stlpcov
  
    u=1;w=r; // pomocne premenne, ktore mi pomahaju vytvorit trojuholnik
    pol=((r+1)/2);
  for (i=0;i<pol;i++){ //stlpce obrazka
    
    for(n=0;n<s;n++){ // opakovanie riadkov obrazka
    
    for (j=r;j>0;j--){ // riadky obrazka
      if (j>=u && j<=w){ // rozsah v ktorom chcem pismena
        printf("%c",c);
        if (j>pol){         //do pol riadku
          if (c=='Z'){c='A'; // inkrementacia znaku aj s kontrolou
          }else{c+=1;}
        } else{				//od pol riadku
          if (c=='Z'){c='A'; // dekrementacia znaku aj s kontrolou
          }else{c-=1;}
        }
      } else {printf(".");}
    }
      
    } // koniec cyklu opak. obrazka do riadku
   c+=2;
   u++;w--; //dekrementuje a inkrementuje pom. premm. a tie mi rozsiruju rozsah v ktorom chcem pismena
   printf("\n");   
  }
  
  //dolna cast obrazka
  
  y=z=pol; // priprava pom. premennych
  y++;z--; // prvy riadok pyramidy nepotrebujeme..
  
  for (k=1;k<pol;k++){ //stlpce obrazka
    for (l=r;l>0;l--){ // riadky obrazka
      if (l<=y && l>=z){ // rozsah v ktorom chcem pismena
        printf("%c",c);
        if (l>pol){         //do pol riadku
          if (c=='Z'){c='A'; // inkrementacia znaku aj s kontrolou
          }else{c+=1;}
        } else{				//od pol riadku
          if (c=='Z'){c='A'; // dekrementacia znaku aj s kontrolou
          }else{c-=1;}
        }
      } else {printf(".");}
    }
   c+=2;
   y++;z--; //dekrementuje a inkrementuje pom. premm. a tie mi rozsiruju rozsah v ktorom chcem pismena
   printf("\n");   
  }
  c='A';
  } // koniec cyklu opak. obrazka do stlpca
  return 0;
}
