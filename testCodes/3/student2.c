#include <stdio.h>


// 0.5 - naznak tvaru 
// 0.5 - riadky 
// 0.5 - stlpce       
// 0 - opakovanie
// 0 - struktura

int main()
{
  int p,v,s,r,i,j,k,l;
  char z='A';
  int p1,p2;
  
  scanf("%d",&p);
  scanf("%d %d %d", &v,&s,&r);
  //p1=0;
  //p2=r+1;
     if ( (p<1) || (p>100)) printf("Nespravny vstup");
      else if ( (v<1) || (v>7)) printf("Nespravny vstup");
       else if ( (s<1) || (s>5)) printf("Nespravny vstup");
        else if ( (r<1) || (r>53) || (r%2==0)) printf("Nespravny vstup");
        else { //zaciatok obrazku
        
        for (k=1;k<=v;k++)
          
        for (i=1;i<=r;i++){
                   
          for (l=1;l<=s;l++)
           
          for (j=1;j<=r;j++){
           
            
            if ( j<=r-(r-i+1 )) putchar('.'); 
          else { printf("%c",z);  (z=='Z') ? z='A' :  z++;}
          }
            
          
          
          putchar('\n');           
        }
        
           
      } // konec obrazku
  return 0;
}

