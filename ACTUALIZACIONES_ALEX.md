## IMPORTACIONES
- winget install --id GitHub.cli -e
    Esta es para que tu copilot pueda hacer Pull Requests, que es para poder si hay conflictos antes de hacer merge en otra branch. TIENES QUE AÑADIRLO DESPUÉS AL PATH(pregunta a gemini si no sabes).

- npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom
    Esta es para que copilot pueda correr los tests y ver que no se ha cargado nada al cambiar algo.

- npm install --save-dev playwright    y     npx playwright install
    Esta es también para los tests, pero es más compleja y ahora mismo solo tiene tests en relación a HOME, así que NO es necesaria para ti, pero sí obligatoria si tocas home o alguna relacionada.

## .ENV
- COPILOT_PC_ID
    Añade esta variable a tu .env con un id que te identifique(por ejemplo alex, yo tengo hector). simplemente escribe COPILOT_PC_IC="alex" y ya. 
    
    Es para que copilot sepa en qué ordenador está y que el tuyo no cambie cosas en mis ramas y que el mío no cambie cosas en tus ramas.

## AUTOPILOT
- AUTOPILOT_PLAN.md
    Para que funcione el autopilot con las branches y demás, tienes que obligatoriamente(por ahora) crear un archivo llamado AUTOPILOT_PLAN.md fuera de todo y poner todo lo que quieres que cambie para que lo haga(luego lo referencias con # en el chat). 

    Realmente, también funcions si le referencias AUTOPILOT_EXECUTION_CHECKLIST.md, que es el protocolo como tal que sigue. 
    
    Pero si tienes un plan, la mejor manera es la anterior, porque al poner el plan en otro archivo te quitas tokens de la sesión y trabaja mejor.


## CONSEJOS
- Cambia de sesión cada poco.
    Cuando llevas unos prompts(como 2-4 largos), copilot empieza a ir lento, a trabajar menos y encima te caen los baneos. Esto lo evitas si creas otras sesiones, y como todo está en el plan o en el protocolo, sabrá perfectamente cómo continuar sin problemas.

- Dile que trabaje más.
    Si le dices que tiene que trabajar mucho más porque tienes premium requests limitadas suele hacer más cosas.