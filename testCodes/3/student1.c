// test.c -- Tyzden 4 - Test
// Juraj Zec, 11.10.2016 14:10:01


// 2 - tvar ok, ale od polovice mali ist dalsie pismena, nie spat - neosetruje nespravny vstup pre velkost obrazca 
// 0.5 - riadky 
// 0.5 - stlpce       
// 0.5 - opakovanie
// 0 - struktura

#include <stdio.h>

int main()
{
  int i, j, k, l, m, p, v, s, r;
  char c;

  scanf("%d", &p);
  c = 'A';

  for (m = 1; m <= p; m++)
  {

    scanf("%d %d %d", &v, &s, &r);

    if (p < 1 || p > 100 || v < 1 || v > 7 || s < 1 || s > 5 || r < 1 || r > 53)
      printf("Zly vstup\n");
    else
    {

      for (k = 1; k <= v; k++)
      {
        for (j = 1; j <= r; j++)
        {
          for (l = 1; l <= s; l++)
          {
            for (i = 1; i <= r; i++)
            {

              if (j <= (r / 2) + 1)
              {
                if (i >= j && i <= (r - j + 1))
                  printf("%c", c);
                else
                  printf(".");
              }

              if (j > (r / 2) + 1)
              {
                if (i > r - j && i <= j)
                  printf("%c", c);
                else
                  printf(".");
              }

              if (i <= (r / 2))
                c += 1;
              else
                c -= 1;
            }
            c = 'A';
          }

          printf("\n");
        }
      }

      printf("\n");
    }
  }
  return 0;
}
