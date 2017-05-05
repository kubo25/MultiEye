// test.c -- Tyzden 4 - Test
// Timotej Gurka, 11.10.2016 14:10:42

// 0.5 - zaklad - tvar iba naznak 
// 0.5 - riadky 
// 0 - stlpce       
// 0.5 - opakovanie
// 0 - struktura

#include <stdio.h>

int main()
{
  int p,v,s,r;
  int i,j,a,c;
  scanf("%d", &p);
  for (a=1; a<=p; a++)
  {
  
  scanf("%d %d %d", &v, &s, &r);
  
  if (((1<=p) && (p<=100)) && ((1<=v) && (v<=7)) && ((1<=s) && (s<=5)) && ((1<=r) && (r<=53)))  
  {
   
    
  for (c=1; c<=v; c++)   
  {
  for (i=1; i<=r; i++)
  {
    for (j=1; j<=r; j++)
    { 
     
      if ((i==j) || ((i<r/2+1) && (i<=j)))
        
      {if (j<=r/2+1) printf("%c", 'A'-1+j);
        else
          if (j>r/2+1) printf("%c", 'A'-1+j-2*(j-(r/2+1)));
           else printf("."); 
      }
      else printf(".");
    
    }
    printf("\n");
    
  }
  }
  }
  else printf("Nespravny vstup");
    printf ("\n");
  }
  
  return 0;
}
